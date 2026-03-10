import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { z } from 'zod';
import Colors from '@/constants/colors';
import { usePetStore, type Pet } from '@/store/petStore';
import { useToast } from '@/context/ToastContext';

const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z
    .string()
    .min(1, 'Age is required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 30,
      'Age must be between 1 and 30',
    ),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      'Price must be a positive number',
    ),
});

type PetFormData = z.infer<typeof petSchema>;

function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType,
  C,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  C: (typeof Colors)['light'];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: C.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textSecondary}
        keyboardType={keyboardType ?? 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: C.inputBg,
            color: C.text,
            borderColor: error ? C.error : focused ? C.primary : C.border,
            fontFamily: 'Inter_400Regular',
          },
        ]}
      />
      {error ? (
        <Text style={[styles.errorText, { color: C.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

export default function AddPetScreen() {
  const colorScheme = useColorScheme();
  const C = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { addPet } = usePetStore();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', breed: '', age: '', price: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof PetFormData, string>>>({});
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingDog, setIsFetchingDog] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 50 : insets.bottom + 50;

  const setField = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = petSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PetFormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Gallery permission required', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera permission required', 'error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setImageError(null);
    }
  };

  const fetchRandomDog = async () => {
    setIsFetchingDog(true);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    try {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      if (data.status === 'success') {
        setImage(data.message);
        setImageError(null);
      } else {
        showToast('Could not fetch dog image', 'error');
      }
    } catch {
      showToast('Failed to fetch dog image', 'error');
    } finally {
      setIsFetchingDog(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;
    if (!image) {
      setImageError('Please add a pet image');
      return;
    }

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      const response = await fetch('https://reqres.in/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          breed: form.breed,
          age: Number(form.age),
          price: Number(form.price),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const newPet: Pet = {
        id: data.id
          ? `api-${data.id}`
          : `${Date.now().toString()}${Math.random().toString(36).substr(2, 9)}`,
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age),
        price: Number(form.price),
        image,
      };

      addPet(newPet);
      showToast(`${form.name} added to the shop!`, 'success');
      setForm({ name: '', breed: '', age: '', price: '' });
      setImage(null);
      router.navigate('/');
    } catch {
      showToast('Failed to submit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
            Add New Pet
          </Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            List a pet for adoption
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
            PET PHOTO
          </Text>

          <View
            style={[
              styles.imagePreview,
              {
                backgroundColor: C.skeleton,
                borderColor: imageError ? C.error : C.border,
              },
            ]}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="paw-outline" size={48} color={C.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: C.textSecondary }]}>
                  No photo selected
                </Text>
              </View>
            )}
          </View>
          {imageError ? (
            <Text style={[styles.errorText, { color: C.error, marginTop: 6 }]}>
              {imageError}
            </Text>
          ) : null}

          <View style={styles.imageActions}>
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.imageActionBtn,
                { backgroundColor: C.card, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="camera" size={20} color={C.primary} />
              <Text style={[styles.imageActionText, { color: C.text }]}>Camera</Text>
            </Pressable>

            <Pressable
              onPress={pickFromGallery}
              style={({ pressed }) => [
                styles.imageActionBtn,
                { backgroundColor: C.card, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="images" size={20} color={C.primary} />
              <Text style={[styles.imageActionText, { color: C.text }]}>Gallery</Text>
            </Pressable>

            <Pressable
              onPress={fetchRandomDog}
              disabled={isFetchingDog}
              style={({ pressed }) => [
                styles.imageActionBtn,
                { backgroundColor: C.card, opacity: pressed || isFetchingDog ? 0.7 : 1 },
              ]}
            >
              {isFetchingDog ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={C.primary} />
              )}
              <Text style={[styles.imageActionText, { color: C.text }]}>Random</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, styles.formSection]}>
          <Text style={[styles.sectionLabel, { color: C.textSecondary, fontFamily: 'Inter_600SemiBold' }]}>
            PET DETAILS
          </Text>

          <FormField
            label="Pet Name"
            value={form.name}
            onChangeText={setField('name')}
            error={errors.name}
            placeholder="e.g. Buddy"
            C={C}
          />
          <FormField
            label="Breed"
            value={form.breed}
            onChangeText={setField('breed')}
            error={errors.breed}
            placeholder="e.g. Golden Retriever"
            C={C}
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField
                label="Age (years)"
                value={form.age}
                onChangeText={setField('age')}
                error={errors.age}
                placeholder="e.g. 2"
                keyboardType="numeric"
                C={C}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <FormField
                label="Price ($)"
                value={form.price}
                onChangeText={setField('price')}
                error={errors.price}
                placeholder="e.g. 1200"
                keyboardType="decimal-pad"
                C={C}
              />
            </View>
          </View>
        </View>

        <View style={styles.submitSection}>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: C.primary,
                opacity: pressed || isSubmitting ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.submitText, { fontFamily: 'Inter_700Bold' }]}>
                  Add to Shop
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  formSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  imagePreview: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageActionText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  submitSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#E87035',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
  },
});
