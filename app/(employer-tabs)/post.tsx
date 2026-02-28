import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { useEmployerStore } from '../../src/store/employerStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORIES, JOB_TYPES } from '../../src/types';

export default function PostJobScreen() {
    const { user } = useAuthStore();
    const { postInternship, postingError } = useEmployerStore();

    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showJobTypes, setShowJobTypes] = useState(false);

    const handlePost = async () => {
        if (!user) return;
        if (!title.trim() || !selectedCategory || !selectedJobType || !description.trim()) {
            Alert.alert('Error', 'Please fill in all required fields (Title, Category, Job Type, Description).');
            return;
        }

        setSubmitting(true);
        try {
            await postInternship(user.uid, user.companyName ?? user.name, {
                title: title.trim(),
                category: selectedCategory,
                jobType: selectedJobType,
                location: location.trim() || 'Remote',
                salary: salary.trim() || 'Negotiable',
                description: description.trim(),
                deadline: deadline.trim(),
                company: user.companyName ?? user.name,
            });

            Alert.alert('Posted! 🎉', 'Your internship has been published and is now visible to all interns.', [
                {
                    text: 'OK',
                    onPress: () => {
                        setTitle('');
                        setSelectedCategory('');
                        setSelectedJobType('');
                        setLocation('');
                        setSalary('');
                        setDescription('');
                        setDeadline('');
                    },
                },
            ]);
        } catch {
            Alert.alert('Error', postingError ?? 'Failed to post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Post an Internship</Text>
                    <Text style={styles.subtitle}>Fill in the details to publish your opening</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <FormField
                        label="Job Title *"
                        icon="briefcase-outline"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Frontend Developer Intern"
                    />

                    {/* Category picker */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <TouchableOpacity
                            style={styles.selectBtn}
                            onPress={() => setShowCategories(!showCategories)}
                        >
                            <Ionicons name="grid-outline" size={16} color={Colors.textMuted} />
                            <Text style={[styles.selectBtnText, !selectedCategory && { color: Colors.textMuted }]}>
                                {selectedCategory || 'Select a category'}
                            </Text>
                            <Ionicons
                                name={showCategories ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>
                        {showCategories && (
                            <View style={styles.dropdown}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.dropdownItem, selectedCategory === cat && styles.dropdownItemActive]}
                                        onPress={() => { setSelectedCategory(cat); setShowCategories(false); }}
                                    >
                                        <Text style={[styles.dropdownText, selectedCategory === cat && styles.dropdownTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Job Type picker */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Job Type *</Text>
                        <TouchableOpacity
                            style={styles.selectBtn}
                            onPress={() => setShowJobTypes(!showJobTypes)}
                        >
                            <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                            <Text style={[styles.selectBtnText, !selectedJobType && { color: Colors.textMuted }]}>
                                {selectedJobType || 'Select type'}
                            </Text>
                            <Ionicons
                                name={showJobTypes ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>
                        {showJobTypes && (
                            <View style={styles.dropdown}>
                                {JOB_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.dropdownItem, selectedJobType === type && styles.dropdownItemActive]}
                                        onPress={() => { setSelectedJobType(type); setShowJobTypes(false); }}
                                    >
                                        <Text style={[styles.dropdownText, selectedJobType === type && styles.dropdownTextActive]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <FormField
                        label="Location"
                        icon="location-outline"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Remote, New York, London..."
                    />
                    <FormField
                        label="Salary / Stipend"
                        icon="cash-outline"
                        value={salary}
                        onChangeText={setSalary}
                        placeholder="$1000/month, Unpaid, Negotiable..."
                    />
                    <FormField
                        label="Application Deadline"
                        icon="calendar-outline"
                        value={deadline}
                        onChangeText={setDeadline}
                        placeholder="March 31, 2026"
                    />

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Job Description *</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the role, responsibilities, and requirements..."
                            placeholderTextColor={Colors.textMuted}
                            style={styles.textArea}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.postBtn, submitting && { opacity: 0.7 }]}
                        onPress={handlePost}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <>
                                <Ionicons name="rocket-outline" size={20} color={Colors.white} />
                                <Text style={styles.postBtnText}>Publish Internship</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function FormField({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
}: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
}) {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
                <Ionicons name={icon} size={16} color={Colors.textMuted} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    style={styles.input}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
    scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge, gap: Spacing.lg },
    fieldGroup: { gap: Spacing.sm },
    label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
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
    selectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    selectBtnText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    dropdown: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    dropdownItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    dropdownItemActive: { backgroundColor: Colors.primaryGhost },
    dropdownText: { fontSize: FontSize.md, color: Colors.text },
    dropdownTextActive: { color: Colors.primaryLight, fontWeight: '600' },
    textArea: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text,
        minHeight: 140,
    },
    postBtn: {
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        ...Shadows.button,
    },
    postBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
