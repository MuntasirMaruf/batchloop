import { redirect } from "next/navigation";

/**
 * Default Wholesaler Segment redirect.
 * Routes /wholesaler directly to /wholesaler/dashboard.
 */
export default function WholesalerPage() {
  redirect("/wholesaler/dashboard");
}
