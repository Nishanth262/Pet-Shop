import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useCartStore } from '@/store/cartStore';
import { usePetStore, type Pet } from '@/store/petStore';
import { useToast } from '@/context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - 24 * 2 - CARD_MARGIN) / NUM_COLUMNS;

function PetCard({ pet }: { pet: Pet }) {
  const colorScheme = useColorScheme();
  const C = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const addToCart = useCartStore((s) => s.addToCart);
  const cartItems = useCartStore((s) => s.items);
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  const inCart = cartItems.some((i) => i.id === pet.id);

  const handleAddToCart = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      price: pet.price,
      image: pet.image,
    });
    showToast(`${pet.name} added to cart!`, 'success');
  }, [pet, addToCart, showToast]);

  return (
    <View style={[styles.card, { backgroundColor: C.card, width: CARD_WIDTH }]}>
      <View style={styles.imageContainer}>
        {imgError ? (
          <View style={[styles.imageFallback, { backgroundColor: C.skeleton }]}>
            <Ionicons name="paw" size={40} color={C.textSecondary} />
          </View>
        ) : (
          <Image
            source={{ uri: pet.image }}
            style={styles.petImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        )}
        <View style={[styles.ageBadge, { backgroundColor: C.primary }]}>
          <Text style={styles.ageText}>{pet.age}y</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text
          style={[styles.petName, { color: C.text, fontFamily: 'Inter_700Bold' }]}
          numberOfLines={1}
        >
          {pet.name}
        </Text>
        <Text
          style={[styles.petBreed, { color: C.textSecondary }]}
          numberOfLines={1}
        >
          {pet.breed}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.petPrice, { color: C.primary, fontFamily: 'Inter_700Bold' }]}>
            ${pet.price.toLocaleString()}
          </Text>
          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.cartBtn,
              {
                backgroundColor: inCart ? C.success : C.primary,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              },
            ]}
          >
            <Ionicons
              name={inCart ? 'checkmark' : 'cart-outline'}
              size={16}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FeaturedDog() {
  const colorScheme = useColorScheme();
  const C = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [imgError, setImgError] = useState(false);

  const { data: dogUrl, isLoading, refetch } = useQuery({
    queryKey: ['randomDog'],
    queryFn: async () => {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      return data.message as string;
    },
    staleTime: 0,
  });

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setImgError(false);
    refetch();
  }, [refetch]);

  return (
    <View style={[styles.featuredCard, { backgroundColor: C.card }]}>
      <View style={styles.featuredHeader}>
        <View>
          <Text style={[styles.featuredLabel, { color: C.textSecondary }]}>
            FEATURED PET
          </Text>
          <Text style={[styles.featuredTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
            Pet of the Day
          </Text>
        </View>
        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [
            styles.refreshBtn,
            { backgroundColor: C.inputBg, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="refresh" size={18} color={C.primary} />
        </Pressable>
      </View>

      <View style={[styles.featuredImageWrapper, { backgroundColor: C.skeleton }]}>
        {isLoading ? (
          <ActivityIndicator color={C.primary} size="large" />
        ) : imgError || !dogUrl ? (
          <View style={styles.featuredFallback}>
            <Ionicons name="paw" size={52} color={C.textSecondary} />
            <Text style={[styles.featuredFallbackText, { color: C.textSecondary }]}>
              Could not load image
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: dogUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        )}
      </View>
    </View>
  );
}

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const C = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const pets = usePetStore((s) => s.pets);
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
              PawShop
            </Text>
            <Text style={[styles.headerSub, { color: C.textSecondary }]}>
              Find your perfect companion
            </Text>
          </View>
          <Ionicons name="paw" size={28} color={C.primary} />
        </View>
        <FeaturedDog />
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
            Our Pets
          </Text>
          <Text style={[styles.petCount, { color: C.textSecondary }]}>
            {pets.length} available
          </Text>
        </View>
      </View>
    ),
    [C, topPad, pets.length],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="paw-outline" size={60} color={C.textSecondary} />
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>
          No pets yet. Add your first pet!
        </Text>
      </View>
    ),
    [C],
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PetCard pet={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad + 24 },
        ]}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  featuredCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  featuredLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
  },
  featuredTitle: {
    fontSize: 18,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageWrapper: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredFallback: {
    alignItems: 'center',
    gap: 8,
  },
  featuredFallbackText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
  },
  petCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: CARD_WIDTH,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: 130,
  },
  imageFallback: {
    width: '100%',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ageText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  cardBody: {
    padding: 10,
  },
  petName: {
    fontSize: 14,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petPrice: {
    fontSize: 15,
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
