import { redirect } from "next/navigation";

/**
 * Default Shop Segment redirect.
 * Routes /shop directly to /shop/catalog.
 */
export default function ShopPage() {
  redirect("/shop/catalog");
}
