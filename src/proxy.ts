import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
    throw new Error("ERRO: SESSION_SECRET couldn't be found.");
}

const key = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {

    const session = request.cookies.get("session")?.value;

    if (request.nextUrl.pathname.startsWith("/admin")) {

        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(session, key, {
                algorithms: ["HS256"],
            });

            if (payload.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", request.url));
            }

            return NextResponse.next();

        } catch (error) {
            console.log("Token inválido no middleware:", error);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};