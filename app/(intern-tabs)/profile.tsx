import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../../src/store';
import { CustomButton } from '../../src/components';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';

export default function InternProfileScreen() {
    const { user, logout, updateProfile, loading } = useAuthStore();

    const [name, setName] = useState(user?.name ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [skills, setSkills] = useState(user?.skills.join(', ') ?? '');
    const [github, setGithub] = useState(user?.github ?? '');
    const [linkedin, setLinkedin] = useState(user?.linkedin ?? '');
    const [editing, setEditing] = useState(false);
    const [resumeName, setResumeName] = useState(user?.resumeName ?? '');

    const handleSave = async () => {
        const skillsArray = skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        await updateProfile({
            name: name.trim(),
            bio: bio.trim(),
            skills: skillsArray,
            github: github.trim(),
            linkedin: linkedin.trim(),
        });
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
    };

    const handleUploadResume = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets.length > 0) {
                const file = result.assets[0];
                setResumeName(file.name);
                await updateProfile({
                    resumeUri: file.uri,
                    resumeName: file.name,
                });
                Alert.alert('Resume Uploaded', `${file.name} has been saved to your profile.`);
            }
        } catch {
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const initials = (user?.name ?? 'U')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name="school-outline" size={12} color={Colors.primary} />
                        <Text style={styles.roleBadgeText}>Intern Seeker</Text>
                    </View>
                </View>

                {/* Resume Card */}
                <View style={[styles.resumeCard, Shadows.card]}>
                    <View style={styles.resumeCardLeft}>
                        <Ionicons
                            name={resumeName ? 'document-text' : 'document-text-outline'}
                            size={28}
                            color={resumeName ? Colors.accent : Colors.textMuted}
                        />
                        <View>
                            <Text style={styles.resumeTitle}>Resume</Text>
                            <Text style={styles.resumeSubtitle} numberOfLines={1}>
                                {resumeName || 'No resume uploaded yet'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadResume}>
                        <Ionicons name="cloud-upload-outline" size={16} color={Colors.primary} />
                        <Text style={styles.uploadBtnText}>{resumeName ? 'Replace' : 'Upload'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Skills */}
                {user?.skills && user.skills.length > 0 && !editing && (
                    <View style={[styles.section, Shadows.card]}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsWrap}>
                            {user.skills.map((skill, i) => (
                                <View key={i} style={styles.skillChip}>
                                    <Text style={styles.skillChipText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Profile form */}
                <View style={[styles.section, Shadows.card]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Profile Details</Text>
                        <TouchableOpacity onPress={() => setEditing(!editing)}>
                            <Ionicons
                                name={editing ? 'close' : 'create-outline'}
                                size={22}
                                color={Colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <ProfileField
                        icon="person-outline"
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        editable={editing}
                    />
                    <ProfileField
                        icon="information-circle-outline"
                        label="Bio"
                        value={bio}
                        onChangeText={setBio}
                        editable={editing}
                        placeholder="Tell employers about yourself"
                        multiline
                    />
                    <ProfileField
                        icon="code-slash-outline"
                        label="Skills (comma-separated)"
                        value={skills}
                        onChangeText={setSkills}
                        editable={editing}
                        placeholder="React, TypeScript, Node.js"
                    />
                    <ProfileField
                        icon="logo-github"
                        label="GitHub"
                        value={github}
                        onChangeText={setGithub}
                        editable={editing}
                        placeholder="https://github.com/username"
                    />
                    <ProfileField
                        icon="logo-linkedin"
                        label="LinkedIn"
                        value={linkedin}
                        onChangeText={setLinkedin}
                        editable={editing}
                        placeholder="https://linkedin.com/in/username"
                    />

                    {editing && (
                        <CustomButton
                            title="Save Changes"
                            onPress={handleSave}
                            loading={loading}
                            fullWidth
                            style={{ marginTop: Spacing.lg }}
                        />
                    )}
                </View>

                <CustomButton
                    title="Logout"
                    onPress={handleLogout}
                    variant="danger"
                    fullWidth
                    icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
                    style={{ marginTop: Spacing.xxl }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

function ProfileField({
    icon,
    label,
    value,
    onChangeText,
    editable,
    placeholder,
    multiline,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    editable: boolean;
    placeholder?: string;
    multiline?: boolean;
}) {
    return (
        <View style={fieldStyles.container}>
            <Ionicons name={icon} size={18} color={Colors.textMuted} />
            <View style={fieldStyles.content}>
                <Text style={fieldStyles.label}>{label}</Text>
                {editable ? (
                    <TextInput
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder ?? label}
                        placeholderTextColor={Colors.textMuted}
                        style={[fieldStyles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
                        autoCapitalize="none"
                        multiline={multiline}
                    />
                ) : (
                    <Text style={fieldStyles.value}>{value || '—'}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge },
    header: { alignItems: 'center', paddingVertical: Spacing.xxxl },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primaryGhost,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarText: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.primary },
    userName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.sm,
        backgroundColor: Colors.primaryGhost,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
    },
    roleBadgeText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600' },
    resumeCard: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    resumeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    resumeTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    resumeSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, maxWidth: 180 },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primaryGhost,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    uploadBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
    skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
    skillChip: {
        backgroundColor: Colors.primaryGhost,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
    },
    skillChipText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600' },
    section: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
});

const fieldStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    content: { flex: 1, gap: 4 },
    label: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: { fontSize: FontSize.md, color: Colors.text },
    input: {
        fontSize: FontSize.md,
        color: Colors.text,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
