import type { components } from './schema';

/**
 * Friendly aliases over the generated OpenAPI schema (`npm run gen:api`).
 * Never hand-write a backend DTO: add an alias here instead.
 */
type Schemas = components['schemas'];

export type TokenResponse = Schemas['TokenResponse'];
export type UserResponse = Schemas['UserResponse'];
export type LoginRequest = Schemas['LoginRequest'];
export type Role = UserResponse['role'];

export type ServiceView = Schemas['ServiceView'];
export type CreateOrderRequest = Schemas['CreateOrderRequest'];
export type CreatedOrder = Schemas['CreatedOrder'];
export type TrackingView = Schemas['TrackingView'];
export type OrderSummary = Schemas['OrderSummary'];
export type OrderDetail = Schemas['OrderDetail'];
export type OrderPage = Schemas['PageResponseOrderSummary'];
export type OrderStats = Schemas['OrderStats'];
export type OrderStatus = OrderDetail['status'];
export type Quote = Schemas['Quote'];
export type QuoteRequest = Schemas['QuoteRequest'];
export type StatusChangeRequest = Schemas['StatusChangeRequest'];
export type NoteRequest = Schemas['NoteRequest'];
export type TimelineEntry = Schemas['TimelineEntry'];
export type FileView = Schemas['FileView'];
export type FileKind = FileView['kind'];

export type StaffView = Schemas['StaffView'];
export type CreateStaffRequest = Schemas['CreateStaffRequest'];
export type UpdateStaffRequest = Schemas['UpdateStaffRequest'];
export type ExpertRef = Schemas['ExpertRef'];
export type ExpertTask = Schemas['ExpertTask'];
export type ExpertTaskDetail = Schemas['ExpertTaskDetail'];
export type PaymentView = Schemas['PaymentView'];
export type PaymentRequest = Schemas['PaymentRequest'];
export type OfficeInfo = Schemas['OfficeInfo'];
export type MoneyStat = Schemas['MoneyStat'];
