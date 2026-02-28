import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../store';
import { useInternshipStore } from '../store';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { parseResumeFromUri } from '../utils/resumeParser';
import type { Internship } from '../types';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ApplyModalProps {
    internship: Internship;
    onClose: () => void;
}

export function ApplyModal({ internship, onClose }: ApplyModalProps) {
    const { user, firebaseUser } = useAuthStore();
    const { applyToInternship, hasApplied } = useInternshipStore();

    // firebaseUser is always set when authenticated; user (Firestore profile) may lag
    const uid = firebaseUser?.uid ?? user?.uid ?? '';

    const [applicantName, setApplicantName] = useState(user?.name ?? firebaseUser?.displayName ?? '');
    const [applicantEmail, setApplicantEmail] = useState(user?.email ?? firebaseUser?.email ?? '');
    const [coverNote, setCoverNote] = useState('');
    const [resumeUri, setResumeUri] = useState(user?.resumeUri ?? '');
    const [resumeName, setResumeName] = useState(user?.resumeName ?? '');
    const [parsing, setParsing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const alreadyApplied = hasApplied(internship.id);

    const handlePickResume = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets.length > 0) {
                const file = result.assets[0];
                setResumeUri(file.uri);
                setResumeName(file.name);

                setParsing(true);
                try {
                    const parsed = await parseResumeFromUri(file.uri);
                    if (parsed.name && !applicantName) setApplicantName(parsed.name);
                    if (parsed.email && !applicantEmail) setApplicantEmail(parsed.email);
                } finally {
                    setParsing(false);
                }
            }
        } catch {
            Alert.alert('Error', 'Failed to pick document.');
        }
    }, [applicantName, applicantEmail]);

    const handleSubmit = useCallback(async () => {
        if (!uid) {
            Alert.alert('Error', 'You must be logged in to apply.');
            return;
        }
        if (!applicantName.trim() || !applicantEmail.trim()) {
            Alert.alert('Error', 'Please fill in your name and email.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Save to intern's own application tracker
            await applyToInternship(uid, internship, {
                applicantName: applicantName.trim(),
                applicantEmail: applicantEmail.trim(),
                coverNote: coverNote.trim(),
                resumeUri,
                resumeName,
            });

            // 2. For in-app jobs: also write to employer's applicants sub-collection
            //    This is best-effort — don't block success if it fails
            if (internship.source === 'inapp' && internship.postedBy) {
                try {
                    // Strip large description to keep doc size small
                    const { description: _desc, ...internshipMeta } = internship;
                    const applicantDoc = {
                        internshipId: internship.id,
                        internshipTitle: internship.title,
                        internshipCompany: internship.company,
                        status: 'Applied',
                        appliedAt: new Date().toISOString(),
                        applicantName: applicantName.trim(),
                        applicantEmail: applicantEmail.trim(),
                        coverNote: coverNote.trim(),
                        resumeUri: resumeUri || '',
                        resumeName: resumeName || '',
                        parsedSkills: user?.skills ?? [],
                    };
                    await setDoc(
                        doc(db, 'internships', String(internship.id), 'applicants', uid),
                        applicantDoc,
                    );
                } catch (e) {
                    // Non-fatal: intern's own tracker write already succeeded
                    console.warn('Applicant sub-collection write failed:', e);
                }
            }

            Alert.alert('Applied! 🎉', 'Your application has been submitted.', [
                { text: 'OK', onPress: onClose },
            ]);
        } catch (e) {
            console.error('Apply error:', e);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [uid, applicantName, applicantEmail, coverNote, resumeUri, resumeName, internship, applyToInternship, onClose, user]);

    return (
        <Modal visible animationType="slide" transparent onRequestClose={onClose}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.kav}
            >
                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.sheetTitle} numberOfLines={1}>
                                Apply to {internship.title}
                            </Text>
                            <Text style={styles.sheetCompany}>{internship.company}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {alreadyApplied ? (
                        <View style={styles.alreadyApplied}>
                            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                            <Text style={styles.alreadyAppliedText}>Already Applied!</Text>
                            <Text style={styles.alreadyAppliedSub}>
                                You have already applied for this position.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={styles.formScroll}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Resume picker */}
                            <TouchableOpacity
                                style={styles.resumePicker}
                                onPress={handlePickResume}
                                disabled={parsing}
                            >
                                {parsing ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <Ionicons
                                        name={resumeUri ? 'document-text' : 'cloud-upload-outline'}
                                        size={22}
                                        color={resumeUri ? Colors.accent : Colors.primary}
                                    />
                                )}
                                <View style={styles.resumePickerText}>
                                    <Text style={styles.resumePickerTitle}>
                                        {parsing ? 'Parsing resume...' : resumeUri ? 'Resume attached' : 'Attach Resume'}
                                    </Text>
                                    <Text style={styles.resumePickerSub} numberOfLines={1}>
                                        {resumeName || 'PDF or DOC — fields will auto-fill'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>

                            {/* Name */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Full Name</Text>
                                <View style={styles.inputRow}>
                                    <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
                                    <TextInput
                                        value={applicantName}
                                        onChangeText={setApplicantName}
                                        placeholder="Your full name"
                                        placeholderTextColor={Colors.textMuted}
                                        style={styles.input}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Email</Text>
                                <View style={styles.inputRow}>
                                    <Ionicons name="mail-outline" size={16} color={Colors.textMuted} />
                                    <TextInput
                                        value={applicantEmail}
                                        onChangeText={setApplicantEmail}
                                        placeholder="you@example.com"
                                        placeholderTextColor={Colors.textMuted}
                                        style={styles.input}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Cover Note */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Cover Note (optional)</Text>
                                <TextInput
                                    value={coverNote}
                                    onChangeText={setCoverNote}
                                    placeholder="Tell them why you're a great fit..."
                                    placeholderTextColor={Colors.textMuted}
                                    style={styles.textArea}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <>
                                        <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
                                        <Text style={styles.submitBtnText}>Submit Application</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.overlay,
    },
    kav: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        maxHeight: '90%',
        borderTopWidth: 1,
        borderColor: Colors.border,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: BorderRadius.full,
        alignSelf: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerText: { flex: 1, gap: 4 },
    sheetTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
    sheetCompany: { fontSize: FontSize.sm, color: Colors.textSecondary },
    closeBtn: { padding: 4 },
    formScroll: { padding: Spacing.xxl, gap: Spacing.lg },
    resumePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    resumePickerText: { flex: 1 },
    resumePickerTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    resumePickerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    fieldGroup: { gap: Spacing.sm },
    fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    input: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: Spacing.md },
    textArea: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text,
        height: 100,
    },
    submitBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        ...Shadows.button,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
    alreadyApplied: {
        padding: Spacing.huge,
        alignItems: 'center',
        gap: Spacing.md,
    },
    alreadyAppliedText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    alreadyAppliedSub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
});
