# Firestore Database Schema

## Collections

### `users`
Customer accounts created during signup.

| Field      | Type      | Description                    |
|------------|-----------|--------------------------------|
| uid        | string    | Firebase Auth UID (= doc ID)   |
| name       | string    | Customer's full name           |
| email      | string    | Customer's email address       |
| createdAt  | timestamp | Account creation timestamp     |

---

### `admins`
Admin accounts (separate from customers).

| Field      | Type      | Description                    |
|------------|-----------|--------------------------------|
| uid        | string    | Firebase Auth UID (= doc ID)   |
| name       | string    | Admin's full name              |
| email      | string    | Admin's email address          |
| role       | string    | Always `"admin"`               |
| createdAt  | timestamp | Account creation timestamp     |

---

### `orders`
Customer orders placed through the cart.

| Field           | Type      | Description                                  |
|-----------------|-----------|----------------------------------------------|
| customerId      | string    | UID of the customer who placed the order      |
| customerName    | string    | Display name of the customer                  |
| customerEmail   | string    | Email of the customer                         |
| items           | array     | Array of ordered items (see sub-schema below) |
| subtotal        | number    | Sum of item prices × quantities               |
| total           | number    | Subtotal + delivery fee                       |
| deliveryDetails | map       | Delivery info (see sub-schema below)          |
| status          | string    | `"pending"` → `"preparing"` → `"ready"` → `"completed"` |
| createdAt       | timestamp | Order placement timestamp                     |
| updatedAt       | timestamp | Last status update timestamp                  |

#### `items[]` sub-schema:
| Field    | Type   | Description          |
|----------|--------|----------------------|
| id       | number | Menu item ID         |
| name     | string | Item name            |
| price    | number | Price per unit (₹)   |
| quantity | number | Number ordered       |
| img      | string | Image URL            |

#### `deliveryDetails` sub-schema:
| Field        | Type   | Description                          |
|--------------|--------|--------------------------------------|
| place        | string | Customer's location                  |
| phone        | string | Phone number                         |
| deliveryZone | string | `"within100"` or `"beyond100"`       |
| deliveryFee  | number | `0` or `20`                          |
| date         | string | Requested delivery date              |
| time         | string | Requested delivery time              |

---

### `menu`
Menu items (optional — app currently uses hardcoded data).

| Field     | Type    | Description                      |
|-----------|---------|----------------------------------|
| name      | string  | Item name                        |
| price     | number  | Price in ₹                       |
| category  | string  | `"snacks"`, `"burgers"`, `"drinks"` |
| imageUrl  | string  | Image URL                        |
| available | boolean | Whether item is currently offered |

---

## Status Flow

```
pending → preparing → ready → completed
```

- **pending**: Order just placed by customer
- **preparing**: Admin acknowledged, kitchen is preparing
- **ready**: Food is ready for pickup/delivery
- **completed**: Order delivered/picked up, finalized
