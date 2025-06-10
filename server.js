import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import 'dotenv/config'

// Required .env variables:
// process.env.EMAIL_USER
// process.env.EMAIL_PASSWORD
// process.env.CORP_DOMAIN
// TO_EMAIL=destination_email

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
	origin: (origin, callback) => {
    // If no origin (like for some tools or local requests), allow it
    if (!origin
			|| [
					`https://${process.env.CORP_DOMAIN}`,
					`https://www.${process.env.CORP_DOMAIN}`,
				].includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS')); // Deny request
    }
  },
	methods: ['POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
}))

const transporter = nodemailer.createTransport({
  service: 'Yandex',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendEnquiryEmail({
  name,
  email,
  tel,
  message,
  attachments
}) {
  await transporter.sendMail({
    from: `${name} <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: `${name} <${email}>`,
    subject: 'Заявка на сайте',
    html: `
      <p><strong>Имя:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Тел:</strong> ${tel}</p>
      <p><strong>Сообщение:</strong><br>${message}</p>
      <p><strong>Согласие на обработку ПД:</strong> Получено</p>
    `,
    attachments
  })
}

app.post('/enquiry', upload.array('attachments'), async (req, res) => {
  try {
    const { name, email, tel, message } = req.body
    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }))
    await sendEnquiryEmail({ name, email, tel, message, attachments })
    res.status(200).send('Enquiry email sent!')
  } catch (err) {
    console.error('Error sending enquiry email:', err)
    res.status(500).send('Failed to send enquiry email')
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Enquiry email server listening on port ${port}`)
}) 
