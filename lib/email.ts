import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM_EMAIL = 'auth.chivalafricannigerianrestaurant@pocketreply.tech'

export async function sendVerificationCode(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `CHIVAL Auth <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your CHIVAL Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05);">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <div style="font-size: 32px; font-weight: 700; color: #C8A24C;">
                          CHIVAL
                        </div>
                        <div style="font-size: 14px; color: #888; margin-top: 4px;">
                          African Nigerian Restaurant
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0; text-align: center;">
                          Your Verification Code
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 24px; text-align: center;">
                        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0;">
                          Enter this code to complete your sign in or sign up:
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 32px 0;">
                        <div style="background: #f8f6f3; border-radius: 12px; padding: 24px 40px; display: inline-block; letter-spacing: 8px; font-size: 36px; font-weight: 700; color: #C8A24C; font-family: monospace;">
                          ${code}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px; text-align: center;">
                        <p style="font-size: 14px; color: #888; margin: 0;">
                          This code will expire in <strong style="color: #1a1a1a;">30 minutes</strong>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 24px; text-align: center;">
                        <p style="font-size: 13px; color: #aaa; margin: 0;">
                          If you didn't request this code, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
                        <p style="font-size: 12px; color: #bbb; margin: 0;">
                          CHIVAL • 53 Dunlop St E, Barrie, ON L4M 1A2
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `CHIVAL <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to CHIVAL! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.05);">
                    <tr>
                      <td align="center" style="padding-bottom: 24px;">
                        <div style="font-size: 32px; font-weight: 700; color: #C8A24C;">
                          CHIVAL
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0; text-align: center;">
                          Welcome to CHIVAL! 🎉
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 24px; text-align: center;">
                        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.8; margin: 0;">
                          ${name ? `Hi ${name},` : 'Hi there!'}
                          <br /><br />
                          Welcome to CHIVAL! You're now part of our community.
                          <br /><br />
                          We serve authentic Nigerian cuisine in the heart of Barrie.
                          Explore our menu and place your first order today!
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 16px 0 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/menu" style="display: inline-block; background: linear-gradient(to right, #DAB866, #C8A24C, #B08A3A); color: white; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                          Browse Our Menu
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
                        <p style="font-size: 12px; color: #bbb; margin: 0;">
                          CHIVAL • 53 Dunlop St E, Barrie, ON L4M 1A2
                        </p>
                        <p style="font-size: 12px; color: #bbb; margin: 4px 0 0;">
                          © ${new Date().getFullYear()} CHIVAL. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Welcome email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Welcome email error:', error)
    return { success: false, error }
  }
}