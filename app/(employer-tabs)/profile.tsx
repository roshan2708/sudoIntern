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

export default function EmployerProfileScreen() {
    const { user, logout, updateProfile, loading } = useAuthStore();

    const [name, setName] = useState(user?.name ?? '');
    const [companyName, setCompanyName] = useState(user?.companyName ?? '');
    const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite ?? '');
    const [companyAbout, setCompanyAbout] = useState(user?.companyAbout ?? '');
    const [editing, setEditing] = useState(false);

    const handleSave = async () => {
        await updateProfile({
            name: name.trim(),
            companyName: companyName.trim(),
            companyWebsite: companyWebsite.trim(),
            companyAbout: companyAbout.trim(),
        });
        setEditing(false);
        Alert.alert('Saved', 'Company profile updated.');
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const initials = (user?.companyName ?? user?.name ?? 'C')
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
                    <Text style={styles.companyName}>
                        {user?.companyName || user?.name || 'Your Company'}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name="business-outline" size={12} color={Colors.accent} />
                        <Text style={styles.roleBadgeText}>Employer</Text>
                    </View>
                </View>

                {/* Company Details */}
                <View style={[styles.section, Shadows.card]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Company Profile</Text>
                        <TouchableOpacity onPress={() => setEditing(!editing)}>
                            <Ionicons
                                name={editing ? 'close' : 'create-outline'}
                                size={22}
                                color={Colors.accent}
                            />
                        </TouchableOpacity>
                    </View>

                    <ProfileField
                        icon="person-outline"
                        label="Contact Name"
                        value={name}
                        onChangeText={setName}
                        editable={editing}
                    />
                    <ProfileField
                        icon="business-outline"
                        label="Company Name"
                        value={companyName}
                        onChangeText={setCompanyName}
                        editable={editing}
                        placeholder="Acme Corp"
                    />
                    <ProfileField
                        icon="globe-outline"
                        label="Website"
                        value={companyWebsite}
                        onChangeText={setCompanyWebsite}
                        editable={editing}
                        placeholder="https://yourcompany.com"
                    />
                    <ProfileField
                        icon="information-circle-outline"
                        label="About Company"
                        value={companyAbout}
                        onChangeText={setCompanyAbout}
                        editable={editing}
                        placeholder="What does your company do?"
                        multiline
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
        backgroundColor: 'rgba(0,206,201,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    avatarText: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.accent },
    companyName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.sm,
        backgroundColor: 'rgba(0,206,201,0.12)',
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
    },
    roleBadgeText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '600' },
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
