import React, { useCallback } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';

function CartItemRow({
  item,
  onRemove,
  C,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  C: (typeof Colors)['light'];
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <View style={[styles.cartItem, { backgroundColor: C.card }]}>
      <View style={[styles.itemImageWrapper, { backgroundColor: C.skeleton }]}>
        {imgError ? (
          <Ionicons name="paw" size={28} color={C.textSecondary} />
        ) : (
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, { color: C.text, fontFamily: 'Inter_600SemiBold' }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.itemBreed, { color: C.textSecondary }]}
          numberOfLines={1}
        >
          {item.breed} · {item.age}y
        </Text>
        <View style={styles.itemPriceRow}>
          <Text style={[styles.itemPrice, { color: C.primary, fontFamily: 'Inter_700Bold' }]}>
            ${item.price.toLocaleString()}
          </Text>
          {item.quantity > 1 && (
            <Text style={[styles.itemQty, { color: C.textSecondary }]}>
              × {item.quantity}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={() => onRemove(item.id)}
        style={({ pressed }) => [
          styles.removeBtn,
          { backgroundColor: C.skeleton, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name="trash-outline" size={18} color={C.error} />
      </Pressable>
    </View>
  );
}

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const C = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, clearCart, getTotal } = useCartStore();
  const { showToast } = useToast();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleRemove = useCallback(
    (id: string) => {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      removeFromCart(id);
      showToast('Item removed from cart', 'info');
    },
    [removeFromCart, showToast],
  );

  const handleClear = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    clearCart();
    showToast('Cart cleared', 'info');
  }, [clearCart, showToast]);

  const total = getTotal();

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="cart-outline" size={72} color={C.textSecondary} />
        <Text style={[styles.emptyTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
          Your cart is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
          Browse the shop and add pets you love
        </Text>
      </View>
    ),
    [C],
  );

  const renderHeader = useCallback(
    () => (
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
            My Cart
          </Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        {items.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [
              styles.clearBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.clearBtnText, { color: C.error }]}>Clear all</Text>
          </Pressable>
        )}
      </View>
    ),
    [C, topPad, items.length, handleClear],
  );

  const renderFooter = useCallback(
    () =>
      items.length > 0 ? (
        <View style={[styles.footer, { backgroundColor: C.card, paddingBottom: bottomPad + 16 }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: C.text, fontFamily: 'Inter_700Bold' }]}>
              ${total.toLocaleString()}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.checkoutBtn,
              {
                backgroundColor: C.primary,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={() => {
              if (Platform.OS !== 'web')
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showToast('Checkout successful!', 'success');
              clearCart();
            }}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={[styles.checkoutText, { fontFamily: 'Inter_700Bold' }]}>
              Checkout · ${total.toLocaleString()}
            </Text>
          </Pressable>
        </View>
      ) : null,
    [C, items.length, total, bottomPad, clearCart, showToast],
  );

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow item={item} onRemove={handleRemove} C={C} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    marginTop: 4,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  listContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemName: {
    fontSize: 15,
    marginBottom: 2,
  },
  itemBreed: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 6,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemPrice: {
    fontSize: 16,
  },
  itemQty: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  removeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    marginTop: 12,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  totalAmount: {
    fontSize: 24,
  },
  checkoutBtn: {
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
  checkoutText: {
    color: '#fff',
    fontSize: 17,
  },
});
