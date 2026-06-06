import { redirect } from "next/navigation";

export default function InProgressRedirect() {
  redirect("/status");
}
