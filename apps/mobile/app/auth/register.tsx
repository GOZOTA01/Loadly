import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { registerSchema, USER_ROLE } from '@loadly/shared'
import type { z } from 'zod'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Colors } from '@/lib/colors'

type FormData = z.infer<typeof registerSchema>

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp, loading } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<'customer' | 'driver'>('customer')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' },
  })

  const onSubmit = async (data: FormData) => {
    const error = await signUp(data)
    if (error) {
      Alert.alert('Registration failed', error)
    } else {
      Alert.alert('Account created!', 'Please check your email to verify your account.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ])
    }
  }

  const selectRole = (role: 'customer' | 'driver') => {
    setSelectedRole(role)
    setValue('role', role)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, selectedRole === 'customer' && styles.roleBtnActive]}
            onPress={() => selectRole('customer')}
          >
            <Text style={[styles.roleBtnText, selectedRole === 'customer' && styles.roleBtnTextActive]}>
              I'm a Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, selectedRole === 'driver' && styles.roleBtnActive]}
            onPress={() => selectRole('driver')}
          >
            <Text style={[styles.roleBtnText, selectedRole === 'driver' && styles.roleBtnTextActive]}>
              I'm a Driver
            </Text>
          </TouchableOpacity>
        </View>

        {(['full_name', 'email', 'phone', 'password'] as const).map((field) => (
          <Controller
            key={field}
            control={control}
            name={field}
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldWrap}>
                <TextInput
                  style={[styles.input, errors[field] && styles.inputError]}
                  placeholder={
                    field === 'full_name'
                      ? 'Full name'
                      : field === 'email'
                        ? 'Email address'
                        : field === 'phone'
                          ? 'Phone number'
                          : 'Password (min 8 chars)'
                  }
                  keyboardType={
                    field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'
                  }
                  autoCapitalize={field === 'full_name' ? 'words' : 'none'}
                  secureTextEntry={field === 'password'}
                  onChangeText={onChange}
                  value={value}
                />
                {errors[field] && (
                  <Text style={styles.errorText}>{errors[field]?.message}</Text>
                )}
              </View>
            )}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleBtnText: { fontWeight: '600', color: Colors.textMuted },
  roleBtnTextActive: { color: Colors.primary },
  fieldWrap: { marginBottom: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fafafa',
  },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', paddingVertical: 16 },
  linkText: { color: Colors.primary, fontSize: 14 },
})
