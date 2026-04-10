// api/send-email.js
// Serverless function за испраќање email нотификации преку Resend

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Вечен Спомен <noreply@vechen-spomen.mk>';

async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${err}`);
  }
  return response.json();
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="mk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 20px;">
    <tr><td>
      <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#d6d3d1;font-size:9px;letter-spacing:4px;font-family:Arial,sans-serif;font-weight:700;text-transform:uppercase;">ВЕЧЕН СПОМЕН</p>
            <p style="margin:6px 0 0;color:#57534e;font-size:8px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Македонија</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:48px 40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #e7e5e4;text-align:center;">
            <p style="margin:0;color:#a8a29e;font-size:9px;letter-spacing:2px;font-family:Arial,sans-serif;text-transform:uppercase;">
              Вечен Спомен Македонија &nbsp;|&nbsp; Меморијална платформа
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function emailPaymentConfirmed(post, appUrl) {
  const postLink = `${appUrl}/spomen/${post.slug || post.id}`;
  return baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1c1917;font-size:28px;font-weight:400;letter-spacing:-0.5px;">Плаќањето е потврдено</h1>
    <p style="margin:0 0 32px;color:#a8a29e;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Потврда за успешна уплата</p>

    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">Почитувани,</p>
    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">
      Вашата уплата за меморијалната објава на <strong style="color:#1c1917;">${post.fullName}</strong> е успешно примена.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;border:1px solid #e7e5e4;margin:32px 0;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;color:#78716c;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;font-weight:700;">Детали за објавата</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Тип:</strong> ${post.type}</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Пакет:</strong> ${post.package}</p>
        <p style="margin:0;color:#44403c;font-size:14px;"><strong>Статус:</strong> Чека одобрување</p>
      </td></tr>
    </table>

    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">
      Вашата објава е во процес на проверка и ќе биде одобрена во наредните 24 часа. По одобрувањето ќе добиете уште еден e-mail со линк до објавата.
    </p>
    <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.7;">Со сочувство,<br><strong style="color:#1c1917;">Тимот на Вечен Спомен</strong></p>
  `);
}

function emailAdminNewPost(post, appUrl) {
  const adminLink = `${appUrl}/admin`;
  return baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1c1917;font-size:28px;font-weight:400;letter-spacing:-0.5px;">Нова објава чека одобрување</h1>
    <p style="margin:0 0 32px;color:#a8a29e;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Администраторска нотификација</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;border:1px solid #e7e5e4;margin:0 0 32px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 16px;color:#78716c;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;font-weight:700;">Детали</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Лице:</strong> ${post.fullName}</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Тип:</strong> ${post.type}</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Пакет:</strong> ${post.package}</p>
        <p style="margin:0 0 8px;color:#44403c;font-size:14px;"><strong>Град:</strong> ${post.city || '—'}</p>
        <p style="margin:0;color:#44403c;font-size:14px;"><strong>E-пошта:</strong> ${post.email}</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td>
        <a href="${adminLink}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:14px 32px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
          Одди во Админ Панел
        </a>
      </td></tr>
    </table>
  `);
}

function emailApproved(post, appUrl) {
  const postLink = `${appUrl}/spomen/${post.slug || post.id}`;
  return baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1c1917;font-size:28px;font-weight:400;letter-spacing:-0.5px;">Вашата објава е одобрена</h1>
    <p style="margin:0 0 32px;color:#a8a29e;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Меморијалната страна е достапна</p>

    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">Почитувани,</p>
    <p style="margin:0 0 32px;color:#44403c;font-size:15px;line-height:1.7;">
      Меморијалната објава за <strong style="color:#1c1917;">${post.fullName}</strong> е одобрена и достапна на нашата платформа. Можете да го споделите линкот со семејството и пријателите.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr><td>
        <a href="${postLink}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:14px 32px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
          Отвори меморијална страна
        </a>
      </td></tr>
    </table>

    <p style="margin:0 0 8px;color:#78716c;font-size:12px;line-height:1.6;">Или копирајте го линкот:</p>
    <p style="margin:0 0 32px;color:#1c1917;font-size:12px;word-break:break-all;">${postLink}</p>

    <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.7;">Со сочувство,<br><strong style="color:#1c1917;">Тимот на Вечен Спомен</strong></p>
  `);
}

function emailRejected(post) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@vechen-spomen.mk';
  return baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1c1917;font-size:28px;font-weight:400;letter-spacing:-0.5px;">Известување за вашата објава</h1>
    <p style="margin:0 0 32px;color:#a8a29e;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Потребна е дополнителна информација</p>

    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">Почитувани,</p>
    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">
      За жал, меморијалната објава за <strong style="color:#1c1917;">${post.fullName}</strong> не може да биде одобрена во моментов.
    </p>
    <p style="margin:0 0 32px;color:#44403c;font-size:15px;line-height:1.7;">
      За повеќе информации или за да поднесете нова објава, ве молиме контактирајте нè на: <a href="mailto:${adminEmail}" style="color:#1c1917;">${adminEmail}</a>
    </p>

    <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.7;">Со сочувство,<br><strong style="color:#1c1917;">Тимот на Вечен Спомен</strong></p>
  `);
}

function emailReminder(post, reminderType, appUrl) {
  const postLink = `${appUrl}/spomen/${post.slug || post.id}`;

  const labels = {
    '40_days':  { title: '40 дена', text: 'Наскоро се навршуваат 40 дена од заминувањето на', cta: 'ПОМЕН — 40 ДЕНА' },
    '6_months': { title: '6 месеци', text: 'Наскоро се навршуваат 6 месеци од заминувањето на', cta: 'ПОМЕН — 6 МЕСЕЦИ' },
    '1_year':   { title: '1 година', text: 'Наскоро се навршува 1 година од заминувањето на', cta: 'ПОМЕН — 1 ГОДИНА' },
  };
  const label = labels[reminderType] || labels['40_days'];

  const submitUrl = `${appUrl}/objavi?type=ПОМЕН&fullName=${encodeURIComponent(post.fullName)}&relId=${post.id}&relSlug=${post.slug || ''}`;

  return baseTemplate(`
    <h1 style="margin:0 0 8px;color:#1c1917;font-size:28px;font-weight:400;letter-spacing:-0.5px;">Потсетник — ${label.title}</h1>
    <p style="margin:0 0 32px;color:#a8a29e;font-size:9px;letter-spacing:3px;font-family:Arial,sans-serif;text-transform:uppercase;">Меморијален потсетник</p>

    <p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.7;">Почитувани,</p>
    <p style="margin:0 0 32px;color:#44403c;font-size:15px;line-height:1.7;">
      ${label.text} <strong style="color:#1c1917;">${post.fullName}</strong>. Доколку сакате, можете да поставите помен на нашата платформа за да го одбележите овој момент.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr><td>
        <a href="${submitUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:14px 32px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
          Постави ${label.cta}
        </a>
      </td></tr>
    </table>

    <p style="margin:0 0 12px;color:#78716c;font-size:12px;line-height:1.6;">Или погледнете ја постоечката меморијална страна:</p>
    <p style="margin:0 0 32px;">
      <a href="${postLink}" style="color:#1c1917;font-size:12px;">${postLink}</a>
    </p>

    <p style="margin:0;color:#a8a29e;font-size:11px;line-height:1.7;">Доколку не сакате да добивате вакви потсетници, контактирајте нè.</p>
  `);
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ sent: false, reason: 'not_configured' });
  }

  const { type, post } = req.body;
  const appUrl = (process.env.VITE_APP_URL || 'https://vechen-spomen.mk').replace(/\/$/, '');
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!type || !post) {
    return res.status(400).json({ error: 'Missing type or post' });
  }

  try {
    switch (type) {
      case 'payment_confirmed': {
        // To user
        if (post.email) {
          await sendViaResend(
            post.email,
            'Вечен Спомен — Плаќањето е потврдено',
            emailPaymentConfirmed(post, appUrl)
          );
        }
        // To admin
        if (adminEmail) {
          await sendViaResend(
            adminEmail,
            `Нова objava чека одобрување — ${post.fullName}`,
            emailAdminNewPost(post, appUrl)
          );
        }
        break;
      }

      case 'approved': {
        if (post.email) {
          await sendViaResend(
            post.email,
            'Вечен Спомен — Вашата objava е одобрена',
            emailApproved(post, appUrl)
          );
        }
        break;
      }

      case 'rejected': {
        if (post.email) {
          await sendViaResend(
            post.email,
            'Вечен Спомен — Известување за вашата objava',
            emailRejected(post)
          );
        }
        break;
      }

      case 'reminder': {
        if (post.email && post.reminderType) {
          await sendViaResend(
            post.email,
            `Вечен Спомен — Потсетник за ${post.fullName}`,
            emailReminder(post, post.reminderType, appUrl)
          );
        }
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
