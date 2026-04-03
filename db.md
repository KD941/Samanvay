# Database Schema (MongoDB)

This is the MongoDB schema for the MERN conversion of **KarmDeep**.

## Conventions
- `_id`: Mongo ObjectId
- `createdAt`, `updatedAt`: timestamps (Mongoose `timestamps: true`)
- All IDs referencing other docs are stored as ObjectId refs.

---

## Collections

### 1) `users`
Represents platform users (buyers, vendors, admins, etc.).

**Fields**
- `email` (string, unique, required)
- `passwordHash` (string, required) — bcrypt hash
- `name` (string)
- `phone` (string)
- `role` (enum: `admin | buyer | vendor | maintenance | analyst`, required)
- `vendorId` (ObjectId, ref `vendors`, optional) — if user belongs to a vendor org
- `isActive` (boolean, default true)

**Indexes**
- unique index on `email`

---

### 2) `vendors`
Vendor organizations.

**Fields**
- `name` (string, required)
- `email` (string)
- `phone` (string)
- `address` (object)
  - `line1`, `line2`, `city`, `state`, `country`, `pincode`
- `gstin` (string)
- `industryTags` (string[])
- `rating` (number, min 0, max 5)

**Indexes**
- text index on `name` (optional)

---

### 3) `products`
Machines/products offered by vendors.

**Fields**
- `vendorId` (ObjectId, ref `vendors`, required)
- `name` (string, required)
- `category` (string, required) — e.g. CNC/VMC/3D Printer
- `description` (string)
- `specs` (mixed object) — flexible specs per category
- `price` (number)
- `currency` (string, default `INR`)
- `leadTimeDays` (number)
- `images` (string[])
- `isActive` (boolean, default true)

**Indexes**
- compound index `{ vendorId: 1, category: 1 }`
- text index on `name`, `description` (optional)

---

### 4) `tenders`
Tenders published by buyers.

**Fields**
- `buyerId` (ObjectId, ref `users`, required)
- `title` (string, required)
- `description` (string)
- `category` (string, required)
- `quantity` (number, default 1)
- `budget` (number)
- `currency` (string, default `INR`)
- `deadlineAt` (Date, required)
- `status` (enum: `draft | published | closed | awarded | cancelled`, default `published`)
- `requirements` (mixed object)

**Indexes**
- `{ category: 1, status: 1, deadlineAt: 1 }`
- `{ buyerId: 1, createdAt: -1 }`

---

### 5) `bids`
Bids submitted against tenders.

**Fields**
- `tenderId` (ObjectId, ref `tenders`, required)
- `vendorId` (ObjectId, ref `vendors`, required)
- `submittedBy` (ObjectId, ref `users`, required)
- `amount` (number, required)
- `currency` (string, default `INR`)
- `leadTimeDays` (number)
- `notes` (string)
- `status` (enum: `submitted | shortlisted | rejected | accepted`, default `submitted`)

**Indexes**
- unique compound index `{ tenderId: 1, vendorId: 1 }` (one bid per vendor per tender)
- `{ tenderId: 1, createdAt: -1 }`

---

### 6) `orders`
Orders created from tenders/bids or direct purchase.

**Fields**
- `buyerId` (ObjectId, ref `users`, required)
- `vendorId` (ObjectId, ref `vendors`, required)
- `tenderId` (ObjectId, ref `tenders`, optional)
- `bidId` (ObjectId, ref `bids`, optional)
- `items` (array)
  - `productId` (ObjectId, ref `products`)
  - `name` (string)
  - `quantity` (number)
  - `unitPrice` (number)
- `totalAmount` (number, required)
- `currency` (string, default `INR`)
- `status` (enum: `created | confirmed | shipped | delivered | installed | cancelled`, default `created`)
- `milestones` (array of objects)
  - `name` (string)
  - `status` (enum: `pending | done`)
  - `dueAt` (Date)

**Indexes**
- `{ buyerId: 1, createdAt: -1 }`
- `{ vendorId: 1, createdAt: -1 }`

---

### 7) `maintenanceSchedules`
Scheduled preventive maintenance plans for installed machines.

**Fields**
- `orderId` (ObjectId, ref `orders`, required)
- `machineSerial` (string)
- `intervalDays` (number, required)
- `nextDueAt` (Date, required)
- `notes` (string)

**Indexes**
- `{ nextDueAt: 1 }`

---

### 8) `workOrders`
Maintenance work orders (tickets).

**Fields**
- `scheduleId` (ObjectId, ref `maintenanceSchedules`, optional)
- `orderId` (ObjectId, ref `orders`, required)
- `createdBy` (ObjectId, ref `users`, required)
- `assignedTo` (ObjectId, ref `users`, optional)
- `title` (string, required)
- `description` (string)
- `status` (enum: `open | in_progress | blocked | done | cancelled`, default `open`)
- `resolutionNotes` (string)

**Indexes**
- `{ orderId: 1, createdAt: -1 }`
- `{ status: 1, updatedAt: -1 }`

---

### 9) `analyticsEvents`
Event stream for analytics/recommendations.

**Fields**
- `userId` (ObjectId, ref `users`, optional)
- `anonymousId` (string, optional)
- `eventType` (string, required) — e.g. `view_product`, `search`, `submit_bid`
- `properties` (mixed object)
- `occurredAt` (Date, required)

**Indexes**
- `{ eventType: 1, occurredAt: -1 }`
- `{ userId: 1, occurredAt: -1 }`

---

## Relationships (high-level)
- `vendors` 1—N `products`
- `tenders` 1—N `bids`
- `users` (buyers) 1—N `tenders`
- `orders` optionally link to `tenders` and `bids`
- `orders` 1—N `maintenanceSchedules` and `workOrders`

---

## Migration notes (from DynamoDB single-table)
The original project used DynamoDB single-table + GSIs. In MongoDB we model entities as separate collections with explicit references and indexes.
