import { supabase } from "../../lib/supabase";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { name, company, email, phone, details } = req.body;

    // Validate required fields
    if (!name || !email || !details) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const quoteId = `OSQ-${Date.now()}`;

    // Save quote to Supabase
    const { data, error } = await supabase
      .from("quotes")
      .insert([
        {
          quote_id: quoteId,
          name,
          company,
          email,
          phone,
          details,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Send emails if SMTP is configured
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Internal notification email
      await transporter.sendMail({
        from: `Odiscom Supply <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `New Quote Request - ${quoteId}`,
        text: `
New Quote Request Received

Quote ID: ${quoteId}

Company: ${company || "N/A"}
Contact: ${name}
Email: ${email}
Phone: ${phone || "N/A"}

Project Details:
${details}
        `,
      });

      // Customer confirmation email
      await transporter.sendMail({
        from: `Odiscom Supply <${process.env.SMTP_USER}>`,
        to: email,
        subject: `We Received Your Quote Request (${quoteId})`,
        text: `
Hello ${name},

Thank you for contacting Odiscom Supply.

Your quote request has been received successfully.

Quote ID:
${quoteId}

Our team will review your request and contact you shortly.

Thank you,
Odiscom Supply
        `,
      });
    }

    return res.status(200).json({
      success: true,
      quoteId,
      data,
    });
  } catch (err) {
    console.error("API Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
}