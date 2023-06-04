export enum LemonsqueezyDataType {
  checkouts = 'checkouts',
  discounts = 'discounts',
  files = 'files',
  license_key_instances = 'license-key-instances',
  license_keys = 'license-keys',
  order_items = 'order-items',
  orders = 'orders',
  products = 'products',
  stores = 'stores',
  subscriptions = 'subscriptions',
  users = 'users',
  variants = 'variants',
}

type LemonsqueezyInterval = 'day' | 'week' | 'month' | 'year';

/**
 * @docs https://docs.lemonsqueezy.com/api/stores#the-store-object
 */
export interface LemonsqueezyStore {
  attributes: {
    /**
     * The URL for the store avatar
     */
    avatar_url: string;
    /**
     * The full country name for the store (e.g. `United States`, `United Kingdom`, etc)
     */
    country_nicename: string;
    /**
     * The ISO 3166-1 two-letter country code for the store (e.g. `US`, `GB`, etc)
     *
     * @see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
     */
    country: string;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was created
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    created_at: Date;
    /**
     * The ISO 4217 currency code for the store (e.g. `USD`, `GBP`, etc)
     *
     * @see https://en.wikipedia.org/wiki/ISO_4217
     */
    currency: string;
    /**
     * The domain of the store in the format `{slug}.lemonsqueezy.com`
     */
    domain: string;
    /**
     * The name of the store
     */
    name: string;
    /**
     * The current billing plan for the store (e.g. `fresh`, `sweet`)
     */
    plan: string;
    /**
     * The slug used to identify the store
     */
    slug: string;
    /**
     * A positive integer in cents representing the total revenue of the store in USD in the last 30 days
     */
    thirty_day_revenue: number;
    /**
     * A count of the sales made by this store in the last 30 days
     */
    thirty_day_sales: number;
    /**
     * A positive integer in cents representing the total all-time revenue of the store in USD
     */
    total_revenue: number;
    /**
     * A count of the all-time total sales made by this store
     */
    total_sales: number;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was last updated
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    updated_at: Date;
    /**
     * The fully-qualified URL for the store (e.g. `https://{slug}.lemonsqueezy.com)`
     */
    url: string;
  };
  id: string | number;
  links: {
    self: string;
  };
  relationships: Record<
    'products' | 'orders' | 'subscriptions' | 'discounts' | 'license-keys',
    {
      links: LemonsqueezyRelationshipsLinks;
    }
  >;
}

interface LemonsqueezyRelationshipsLinks {
  self: string;
  related: string;
}

interface BaseLemonsqueezyResponse<
  TData,
  TLinks = {
    self: string;
  }
> {
  data: TData;
  errors?: Array<{
    detail: string;
    status: string | number;
    title: string;
  }>;
  jsonapi: {
    version: string;
  };
  links: TLinks;
}

interface PaginatedBaseLemonsqueezyResponse<
  TData,
  TLinks = {
    first: string;
    last: string;
  }
> extends BaseLemonsqueezyResponse<TData, TLinks> {
  meta: {
    page: {
      currentPage: number;
      from: number;
      lastPage: number;
      perPage: number;
      to: number;
      total: number;
    };
  };
}

interface LemonsqueezyProductOptions {
  /**
   * A custom description for the product
   */
  description: string;
  /**
   * An array of variant IDs to enable for this checkout. If this is empty, all variants will be enabled
   */
  enabled_variants: Array<string>;
  /**
   * An array of image URLs to use as the product's media
   */
  media: Array<string>;
  /**
   * A custom name for the product
   */
  name: string;
  /**
   * A custom text to use for the order receipt email button
   */
  receipt_button_text: string;
  /**
   * A custom URL to use for the order receipt email button
   */
  receipt_link_url: string;
  /**
   * A custom thank you note to use for the order receipt email
   */
  receipt_thank_you_note: string;
  /**
   * A custom URL to redirect to after a successful purchase
   */
  redirect_url: string;
}

interface LemonsqueezyBillingAddress {
  /**
   * A pre-filled billing address country in a ISO 3166-1 alpha-2 format
   *
   * @see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
   */
  country: string;
  /**
   * A pre-filled billing address zip/postal code
   */
  zip: string;
}

interface LemonsqueezyCheckoutData {
  billing_address: LemonsqueezyBillingAddress;
  /**
   * An object containing any custom data to be passed to the checkout
   */
  custom: Record<string, any>;
  /**
   * A pre-filled discount code
   */
  discount_code: string;
  /**
   * A pre-filled email address
   */
  email: string;
  /**
   * A pre-filled name
   */
  name: string;
  /**
   * A pre-filled tax number
   */
  tax_number: string;
}

interface LemonsqueezyCheckoutOptions {
  /**
   * A custom hex color to use for the checkout button
   */
  button_color: `#${string}`;
  /**
   * If `true`, use the dark theme
   */
  dark: boolean;
  /**
   * If `false`, hide the product description
   */
  desc: boolean;
  /**
   * If `false`, hide the discount code field
   */
  discount: boolean;
  /**
   * If `true`, show the checkout overlay
   *
   * @docs https://docs.lemonsqueezy.com/help/checkout/checkout-overlay
   */
  embed: boolean;
  /**
   * If `false`, hide the store logo
   */
  logo: boolean;
  /**
   * If `false`, hide the product media
   */
  media: boolean;
}
/**
 * @docs https://docs.lemonsqueezy.com/api/checkouts#the-checkout-object
 */
export interface LemonsqueezyCheckout {
  attributes: {
    /**
     * An object containing any prefill or custom data to be used in the checkout
     *
     * @docs https://docs.lemonsqueezy.com/help/checkout/prefilling-checkout-fields
     * @docs https://docs.lemonsqueezy.com/help/checkout/passing-custom-data
     */
    checkout_data: Partial<LemonsqueezyCheckoutData>;
    /**
     * An object containing checkout options for this checkout
     */
    checkout_options: LemonsqueezyCheckoutOptions;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was created
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    created_at: Date;
    /**
     * If the value is not `null`, this represents a positive integer in cents representing the custom price of the variant
     */
    custom_price: number | null;
    /**
     * An ISO-8601 formatted date-time string indicating when the checkout expires
     *
     * Can be `null` if the checkout is perpetual
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    expires_at: string | null;
    /**
     * An object containing any overridden product options for this checkout
     */
    product_options: LemonsqueezyProductOptions;
    /**
     * The ID of the store this checkout belongs to
     */
    store_id: number;
    /**
     * A boolean indicating if the returned checkout object was created within test mode
     */
    test_mode: boolean;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was last updated
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    updated_at: string;
    /**
     * The unique URL to access the checkout
     *
     * Note: for security reasons, download URLs are signed
     *
     * If the checkout `expires_at` is set, the URL will expire after the specified time
     */
    url: string;
    /**
     * The ID of the variant associated with this checkout
     */
    variant_id: number;
  };
  type: LemonsqueezyDataType.checkouts;
  id: string;
}

export type ListAllStoresResult = PaginatedBaseLemonsqueezyResponse<Array<LemonsqueezyStore>>;

/**
 * @docs https://docs.lemonsqueezy.com/api/variants#the-variant-object
 */
interface LemonsqueezyVariant {
  attributes: {
    /**
     * An ISO-8601 formatted date-time string indicating when the object was created
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    created_at: Date;
    /**
     * The description of the variant in HTML
     */
    description: string;
    /**
     * Has the value `true` if this variant has a free trial period
     *
     * Only available if the variant is a subscription
     */
    has_free_trial: boolean;
    /**
     * Has the value `true` if this variant should generate license keys for the customer on purchase
     */
    has_license_keys: boolean;
    /**
     * If this variant is a subscription, this is the number of intervals (specified in the `interval` attribute) between subscription billings
     *
     * For example, `interval=month` and `interval_count=3` bills every 3 months
     */
    interval_count: number | null;
    /**
     * If this variant is a subscription, this is the frequency at which a subscription is billed
     *
     * One of `day`, `week`, `month` or `year`
     */
    interval: LemonsqueezyInterval | null;
    /**
     * Has the value `true` if license keys should never expire
     *
     * Note: If the variant is a subscription, the license key expiration will be linked to the status of the subscription (e.g. the license will expire when the subscription expires)
     */
    is_license_length_unlimited: boolean;
    /**
     * Has the value `true` if license key activations are unlimited for this variant
     */
    is_license_limit_unlimited: boolean;
    /**
     * Has the value `true` if this variant is a subscription
     */
    is_subscription: boolean;
    /**
     * The maximum number of times a license key can be activated for this variant
     */
    license_activation_limit: number;
    /**
     * The unit linked with the `license_length_value` attribute. One of `days`, `months` or `years`
     *
     * For example, `license_length_value=3` and `license_length_unit=months` license keys will expire after 3 months
     */
    license_length_unit: string;
    /**
     * The number of units (specified in the `license_length_unit` attribute) until a license key expires
     */
    license_length_value: number;
    /**
     * If `pay_what_you_want` is `true`, this is the minimum price this variant can be purchased for, as a positive integer in cents
     */
    min_price: number;
    /**
     * The name of the variant
     */
    name: string;
    /**
     * Has the value `true` if this is a “pay what you want” variant where the price can be set by the customer at checkout
     */
    pay_what_you_want: false;
    /**
     * A positive integer in cents representing the price of the variant
     */
    price: number;
    /**
     * The ID of the product this variant belongs to
     */
    product_id: number;
    /**
     * The slug used to identify the variant
     */
    slug: string;
    /**
     * An integer representing the order of this variant when displayed on the checkout
     */
    sort: number;
    /**
     * The formatted status of the variant
     */
    status_formatted: string;
    /**
     * The status of the variant
     *
     * Either `pending`, `draft` or `published`
     *
     * If a variant has a `pending` status, it is considered the “default” variant and is not shown as a separate option at checkout
     */
    status: 'pending' | 'draft' | 'published';
    /**
     * If `pay_what_you_want` is `true`, this is the suggested price for this variant shown at checkout, as a positive integer in cents
     */
    suggested_price: number;
    /**
     * If interval count of the free trial.
     *
     * For example, a variant with `trial_interval=day` and `trial_interval_count=14` would have a free trial that lasts 14 days
     */
    trial_interval_count: number;
    /**
     * The interval unit of the free trial
     *
     * One of `day`, `week`, `month` or `year`
     */
    trial_interval: string;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was last updated
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    updated_at: Date;
  };
  type: LemonsqueezyDataType.variants;
  id: string;
  relationships: Record<'product', { links: LemonsqueezyRelationshipsLinks }>;
}

export type ListAllVariantsResult = PaginatedBaseLemonsqueezyResponse<Array<LemonsqueezyVariant>>;
export type VariantsResult = PaginatedBaseLemonsqueezyResponse<LemonsqueezyVariant>;

/**
 * @docs https://docs.lemonsqueezy.com/api/products#the-product-object
 */
interface LemonsqueezyProduct {
  attributes: {
    /**
     * A URL to purchase this product using the Lemon Squeezy checkout
     */
    buy_now_url: string;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was created
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    created_at: Date;
    /**
     * The description of the product in HTML
     */
    description: string;
    /**
     * If this product has multiple variants, this will be a positive integer in cents representing the price of the cheapest variant.
     *
     * Otherwise, it will be `null`
     */
    from_price: null;
    /**
     * A URL to the large thumbnail image for this product (if one exists).
     *
     * The image will be 1000x1000px in size
     */
    large_thumb_url: string;
    /**
     * The name of the product
     */
    name: string;
    /**
     * Has the value true if this is a “pay what you want” product where the price can be set by the customer at checkout
     */
    pay_what_you_want: false;
    /**
     * A human-readable string representing the price of the product (e.g. `$9.99`)
     */
    price_formatted: string;
    /**
     * A positive integer in cents representing the price of the product
     */
    price: number;
    /**
     * The slug used to identify the product
     */
    slug: string;
    /**
     * The formatted status of the product
     */
    status_formatted: string;
    /**
     * The status of the product. Either `draft` or `published`
     */
    status: 'draft' | 'published';
    /**
     * The ID of the store this product belongs to
     */
    store_id: number;
    /**
     * A URL to the thumbnail image for this product (if one exists).
     *
     * The image will be 100x100px in size
     */
    thumb_url: string;
    /**
     * If this product has multiple variants, this will be a positive integer in cents representing the price of the most expensive variant.
     *
     * Otherwise, it will be `null`
     */
    to_price: null;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was last updated
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    updated_at: Date;
  };
  type: LemonsqueezyDataType.products;
  id: string;
}

export type ListAllProductResult = PaginatedBaseLemonsqueezyResponse<Array<LemonsqueezyProduct>>;
export type ProductResult = PaginatedBaseLemonsqueezyResponse<LemonsqueezyProduct>;

export type CreateCheckoutResult = BaseLemonsqueezyResponse<LemonsqueezyCheckout>;
export type CreateCheckoutOptions = {
  type: 'checkouts';
  attributes?: Partial<LemonsqueezyCheckout['attributes']>;
  relationships: {
    store: {
      data: {
        type: 'stores';
        id: string;
      };
    };
    variant: {
      data: {
        type: 'variants';
        id: string;
      };
    };
  };
};

/**
 * @docs https://docs.lemonsqueezy.com/api/subscriptions#the-subscription-object
 */
interface LemonsqueezySubscription {
  attributes: {
    /**
     * An integer representing a day of the month (`21` equals `21st day of the month`)
     *
     * This is the day of which subscription invoice payments are collected
     */
    billing_anchor: number;
    /**
     * A boolean indicating if the subscription has been cancelled
     */
    cancelled: boolean;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was created
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    created_at: Date;
    /**
     * If the subscription has been cancelled, this will be an ISO-8601 formatted date-time string indicating when the subscription expires
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    ends_at: Date | null;
    /**
     * The ID of the order associated with this subscription
     */
    order_id: number;
    /**
     * The ID of the order item associated with this subscription
     */
    order_item_id: number;
    /**
     * An object containing the payment collection pause behaviour options for the subscription, if set
     *
     * The pause object can be null, which indicates payment collection is not paused
     */
    pause: LemonsqueezySubscriptionPause | null;
    /**
     * The ID of the product associated with this subscription
     */
    product_id: number;
    /**
     * The name of the product
     */
    product_name: string;
    /**
     * An ISO-8601 formatted date-time string indicating the end of the current billing cycle, and when the next invoice will be issued
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    renews_at: Date;
    /**
     * The formatted status of the subscription
     */
    status_formatted: string;
    /**
     * The status of the subscription
     *
     * One of `on_trial`, `active`, `cancelled`, `expired`
     */
    status: 'on_trial' | 'active' | 'cancelled' | 'expired';
    /**
     * The ID of the store this subscription belongs to
     */
    store_id: number;
    /**
     * A boolean indicating if the returned subscription object was created within test mode
     */
    test_mode: boolean;
    /**
     * If the subscription has a free trial, this will be an ISO-8601 formatted date-time string indicating when the trial period ends
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    trial_ends_at: Date | null;
    /**
     * An ISO-8601 formatted date-time string indicating when the object was last updated
     *
     * @see https://en.wikipedia.org/wiki/ISO_8601
     */
    updated_at: Date;
    /**
     * An object of customer-facing URLs for managing the subscription
     */
    urls: {
      /**
       * A pre-signed URL for managing payment and billing information for the subscription
       *
       * This can be used in conjunction with Lemon.js to allow your customer to change their billing information from within your application
       *
       * The URL is valid for 24 hours from time of request
       *
       * @docs https://docs.lemonsqueezy.com/help/lemonjs/what-is-lemonjs
       */
      update_payment_method: string;
    };
    /**
     * The email address of the customer
     */
    user_email: string;
    /**
     * The full name of the customer
     */
    user_name: string;
    /**
     * The ID of the variant associated with this subscription
     */
    variant_id: number;
    /**
     * The name of the variant
     */
    variant_name: string;
  };
  type: LemonsqueezyDataType.subscriptions;
  id: string | number;
}

export interface LemonsqueezySubscriptionPause {
  /**
   * Defines payment pause behaviour, can be one of:
   *
   *  - `void` - If you can't offer your services for a period of time (for maintenance as an example), you can void invoices so your customers aren't charged
   *  - `free` - Offer your subscription services for free, whilst halting payment collection
   */
  mode: 'void' | 'free';
  /**
   * An ISO-8601 formatted date-time string indicating when the subscription will continue collecting payments
   *
   * @see https://en.wikipedia.org/wiki/ISO_8601
   */
  resumes_at?: Date;
}

export type ListAllSubscriptionsResult = PaginatedBaseLemonsqueezyResponse<Array<LemonsqueezySubscription>>;
export type SubscriptionsResult = PaginatedBaseLemonsqueezyResponse<LemonsqueezySubscription>;

export interface UpdateSubscriptionOptions {
  /**
   * An integer representing a day of the month (`21` equals `21st day of the month`).
   * This is the day of which subscription invoice payments are collected.
   *
   * Setting this value to a valid integer (1-31) will set the billing anchor to the next occurrence of that day.
   * For example, if on the 21st of January you set the subscription billing anchor to the 1st, the next occurrence of that day is February 1st.
   * All invoices from that point on will be generated on the 1st of the month
   *
   * When setting a new billing anchor day, we calculate the next occurrence and issue a paid, prorated trial which ends on the next occurrence date.
   * When the trial ends, the customer is charged for the full prorated amount
   */
  billingAnchor?: number;
  /**
   * Set as `true` to cancel the subscription.
   *
   * You can uncancel (before the `ends_at` date) by setting to `false`
   */
  cancelled?: boolean;
  id: string;
  /**
   * An object containing the payment collection pause behaviour options for the subscription
   * if `null` - manually unpause a paused subscription
   */
  pause?: LemonsqueezySubscriptionPause;
  /**
   * The ID of the Product Object you want to switch this subscription to.
   *
   * If set, requires a Variant Object ID
   *
   * @docs https://docs.lemonsqueezy.com/api/products
   * @docs https://docs.lemonsqueezy.com/api/variants
   */
  productId: string;
  /**
   * The ID of the Variant Object you want to switch this subscription to.
   *
   * Required if `product_id` set
   *
   * @docs https://docs.lemonsqueezy.com/api/variants
   */
  variantId: string;
}
export type UpdateSubscriptionResult = BaseLemonsqueezyResponse<LemonsqueezySubscription>;
export type PauseSubscriptionOptions = {
  data: {
    attributes: {
      pause: LemonsqueezySubscriptionPause | null;
    };
    id: string;
  };
};

/**
 * @docs https://docs.lemonsqueezy.com/api/orders#the-order-object
 */
export interface LemonsqueezyOrderOfWebhook {
  type: 'orders';
  id: string;
  attributes: {
    /**
     * The ID of the store this order belongs to
     */
    store_id: number;
    /**
     * The ID of the customer this order belongs to.
     */
    customer_id: number;
    /**
     * The unique identifier (UUID) for this order
     */
    identifier: string;
    /**
     * An integer representing the sequential order number for this store.
     */
    order_number: number;
    /**
     * The full name of the customer.
     */
    user_name: string;
    /**
     * The email address of the customer.
     */
    user_email: string;
    /**
     * The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code for the order (e.g. USD, GBP, etc).
     */
    currency: string;
    /**
     * If the order currency is USD, this will always be `1.0`.
     * Otherwise, this is the currency conversion rate used to determine the cost of the order in USD at the time of purchase.
     */
    currency_rate: string;
    /**
     * A positive integer in cents representing the subtotal of the order in the order currency.
     */
    subtotal: number;
    /**
     * A positive integer in cents representing the total discount value applied to the order in the order currency.
     */
    discount_total: number;
    /**
     * A positive integer in cents representing the tax applied to the order in the order currency.
     */
    tax: number;
    /**
     * A positive integer in cents representing the total cost of the order in the order currency.
     */
    total: number;
    /**
     * A positive integer in cents representing the subtotal of the order in USD.
     */
    subtotal_usd: number;
    /**
     * A positive integer in cents representing the total discount value applied to the order in USD.
     */
    discount_total_usd: number;
    /**
     * A positive integer in cents representing the tax applied to the order in USD.
     */
    tax_usd: number;
    /**
     * A positive integer in cents representing the total cost of the order in USD.
     */
    total_usd: number;
    /**
     * If tax is applied to the order, this will be the name of the tax rate (e.g. `VAT`, `Sales Tax`, etc).
     */
    tax_name: string;
    /**
     * If tax is applied to the order, this will be the rate of tax as a decimal percentage.
     */
    tax_rate: string;
    /**
     * The status of the order. One of `pending`, `failed`, `paid`, `refunded`.
     */
    status: `pending` | `failed` | `paid` | `refunded`;
    /**
     * The formatted status of the order.
     */
    status_formatted: string;
    /**
     * Has the value `true` if the order has been refunded.
     */
    refunded: boolean;
    /**
     * If the order has been refunded, this will be an [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating when the order was refunded.
     */
    refunded_at: string | null;
    /**
     * A human-readable string representing the subtotal of the order in the order currency (e.g. $9.99).
     */
    subtotal_formatted: string;
    /**
     * A human-readable string representing the total discount value applied to the order in the order currency (e.g. $9.99).
     */
    discount_total_formatted: string;
    /**
     * A human-readable string representing the tax applied to the order in the order currency (e.g. $9.99).
     */
    tax_formatted: string;
    /**
     * A human-readable string representing the total cost of the order in the order currency (e.g. $9.99).
     */
    total_formatted: string;
    /**
     *
     */
    first_order_item: {
      /**
       * The ID of the order item.
       */
      id: number;
      order_id: number;

      product_id: number;

      variant_id: number;

      product_name: string;

      variant_name: string;
      /**
       *  A positive integer in cents representing the price of the order item in the order currency.
       */
      price: number;

      created_at: string;

      updated_at: string;

      test_mode: boolean;
    };
    /**
     * An object of customer-facing URLs for this order.
     */
    urls: {
      /**
       * A pre-signed URL for viewing the order in the customer's [My Orders page](https://docs.lemonsqueezy.com/help/online-store/my-orders)
       */
      receipt: string;
    };
    /**
     *
     */
    created_at: string;
    /**
     *
     */
    updated_at: string;
  };
}

/**
 * @docs https://docs.lemonsqueezy.com/api/subscriptions#the-subscription-object
 */
export interface LemonsqueezySubscriptionOfWebhook {
  type: 'subscriptions';
  id: string;
  attributes: {
    /**
     * The ID of the store this subscription belongs to.
     */
    store_id: number;
    /**
     * The ID of the customer this subscription belongs to.
     */
    customer_id: number;
    /**
     * The ID of the order associated with this subscription.
     */
    order_id: number;
    /**
     * The ID of the order item associated with this subscription.
     */
    order_item_id: number;
    /**
     * The ID of the product associated with this subscription.
     */
    product_id: number;
    /**
     * The ID of the variant associated with this subscription.
     */
    variant_id: number;
    /**
     * The name of the product.
     */
    product_name: string;
    /**
     * The name of the variant.
     */
    variant_name: string;
    /**
     * The full name of the customer.
     */
    user_name: string;
    /**
     * The email address of the customer.
     */
    user_email: string;
    /**
     * The status of the subscription.
     * - `paused`  that the subscription's payment collection has been paused. See pause below for more information.
     *
     * - `past_due`  that a renewal payment failed.
     *    The subscription will go through [4 payment retries](https://docs.lemonsqueezy.com/help/online-store/recovery-dunning#failed-payments) over the course of 2 weeks.
     *    If a retry is successful, the subscription's status changes back to `active`. If all four retries are unsuccessful, the status is changed to `unpaid`.
     *
     * - `unpaid`  that [payment recovery](https://docs.lemonsqueezy.com/help/online-store/recovery-dunning#failed-payments) has been unsuccessful in capturing a payment after 4 attempts.
     *    If dunning is enabled in your store, your dunning rules now will determine if the subscription becomes `expired` after a certain period.
     *    If dunning is turned off, the status remains `unpaid` (it is up to you to determine what this means for users of your product).
     *
     * - `cancelled` means that the customer or store owner has cancelled future payments, but the subscription is still technically active and valid (on a "grace period").
     *    The `ends_at` value shows the date-time when the subscription is scheduled to expire.
     *
     * - `expired` means that the subscription has ended (either it had previously been `cancelled` and the grace period created from its final payment has run out,
     *    or it was previously `unpaid` and the subscription was not re-activated during dunning). The `ends_at` value shows the date-time when the subscription expired. Customers should no longer have access to your product.
     */
    status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
    /**
     * The title-case formatted status of the subscription.
     * For example, when `status` is `active`, `status_formatted` will be `Active` and `past_due` will be `Past due`.
     */
    status_formatted: string;
    /**
     * Lowercase brand of the card used to pay for the latest subscription payment. One of `visa`, `mastercard`, `american_express`, `discover`, `jcb`, `diners_club`.
     * Will be empty for non-card payments.
     */
    card_brand: string;
    /**
     * The last 4 digits of the card used to pay for the latest subscription payment. Will be empty for non-card payments.
     */
    card_last_four: string;
    /**
     * An object containing the payment collection pause behaviour options for the subscription
     */
    pause: LemonsqueezySubscriptionPause | null;
    /**
     * A boolean indicating if the subscription has been cancelled.
     *
     * When cancelled is true:
     * - `status` will be cancelled
     * - `ends_at will` be populated with a date-time string
     */
    cancelled: boolean;
    /**
     * If the subscription has a free trial (`status` is `on_trial`),
     * this will be an [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating when the trial period ends.
     * For all other `status` values, this will be `null`.
     */
    trial_ends_at: any;
    /**
     * An integer representing a day of the month (`21` equals `21st day of the month`).
     * This is the day on which subscription invoice payments are collected.
     */
    billing_anchor: number;
    /**
     * An object of customer-facing URLs for managing the subscription.
     */
    urls: {
      /**
       *  A pre-signed URL for managing payment and billing information for the subscription. This can be used in conjunction with [Lemon.js](https://docs.lemonsqueezy.com/help/lemonjs/what-is-lemonjs) to allow your customer to change their billing information from within your application. The URL is valid for 24 hours from time of request.
       */
      update_payment_method: string;
    };
    /**
     * An [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating the end of the current billing cycle,
     * and when the next invoice will be issued.
     * This also applies to `past_due` subscriptions;
     * `renews_at` will reflect the next renewal charge attempt.
     */
    renews_at: string;
    /**
     * If the subscription has as status of cancelled or expired, this will be an [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating when the subscription expires (or expired).
     * For all other status values, this will be null.
     */
    ends_at: string | null;
    /**
     * An [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating when the object was created.
     */
    created_at: string;
    /**
     * An [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) formatted date-time string indicating when the object was updated.
     */
    updated_at: string;
    test_mode: boolean;
  };
}
