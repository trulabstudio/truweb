import { NextResponse, type NextRequest } from "next/server";

// The token comes from Meta's token generator, so this only returns the user to the panel.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/admin/threads", request.url));
}
