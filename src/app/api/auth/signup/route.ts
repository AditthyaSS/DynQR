import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This route uses the service role key to auto-confirm users
// Only use in development or when email confirmation is not needed
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Create admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // Create user with auto-confirm
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
        })

        if (error) {
            // If user already exists, try to confirm them
            if (error.message.includes('already been registered')) {
                // Get user and confirm
                const { data: users } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = users.users.find(u => u.email === email)

                if (existingUser && !existingUser.email_confirmed_at) {
                    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                        email_confirm: true,
                    })
                    return NextResponse.json({
                        message: 'User confirmed! Please try logging in.',
                        confirmed: true
                    })
                }

                return NextResponse.json({ error: 'Email already registered. Try logging in.' }, { status: 400 })
            }

            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            user: data.user,
            message: 'Account created successfully!'
        }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
