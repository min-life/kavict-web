import { permanentRedirect } from "next/navigation";

export default function AIAssistantRedirectPage() {
  permanentRedirect("/dashboard/finance-management");
}
