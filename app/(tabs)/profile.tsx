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
import { useAuthStore } from '../../src/store';
import { CustomButton } from '../../src/components';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';

export default function ProfileScreen() {
    const { user, logout, updateProfile, loading } = useAuthStore();

    const [name, setName] = useState(user?.name ?? '');
    const [skills, setSkills] = useState(user?.skills.join(', ') ?? '');
    const [github, setGithub] = useState(user?.github ?? '');
    const [linkedin, setLinkedin] = useState(user?.linkedin ?? '');
    const [editing, setEditing] = useState(false);

    const handleSave = async () => {
        const skillsArray = skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        await updateProfile({
            name: name.trim(),
            skills: skillsArray,
            github: github.trim(),
            linkedin: linkedin.trim(),
        });
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.name ?? 'U').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
                </View>

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

                {/* Logout */}
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
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    editable: boolean;
    placeholder?: string;
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
                        style={fieldStyles.input}
                        autoCapitalize="none"
                    />
                ) : (
                    <Text style={fieldStyles.value}>{value || '—'}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scroll: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.huge,
    },
    header: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryGhost,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarText: {
        fontSize: FontSize.xxxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text,
    },
    userEmail: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    section: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
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
    content: {
        flex: 1,
        gap: 4,
    },
    label: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: FontSize.md,
        color: Colors.text,
    },
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
