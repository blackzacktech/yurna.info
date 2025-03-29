import { redirect } from "next/navigation";

export async function GET(request: Request, { params }: { params: { server: string } }) {
  return redirect(`/dashboard/${params.server}/leaderboard`);
}
