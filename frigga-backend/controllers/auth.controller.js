const bcrypt = require('bcrypt');
const supabase = require('../supabase/supabaseClient');
const { generateToken } = require('../utils/jwt');
const { generateResetToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// REGISTER
exports.register = async (req, res) => {
  const { email, password, full_name } = req.body;

  const { data: existingUser } = await supabase
    .from('kb_users')
    .select()
    .eq('email', email)
    .single();

  if (existingUser) return res.status(400).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from('kb_users').insert([
    { email, password_hash: hash, full_name }
  ]);

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'User registered successfully' });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from('kb_users')
    .select()
    .eq('email', email)
    .single();

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  const token = generateToken({ id: user.id, email: user.email });

  res.json({ token });
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const { data: user } = await supabase
    .from('kb_users')
    .select()
    .eq('email', email)
    .single();

  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await supabase.from('kb_password_resets').insert([
    {
      user_id: user.id,
      token,
      expires_at: expiresAt
    }
  ]);

  const link = `http://localhost:3000/reset-password?token=${token}`; // Adjust frontend link

  await sendEmail(
    email,
    'Reset your password',
    `<p>Click <a href="${link}">here</a> to reset your password. This link is valid for 30 minutes.</p>`
  );

  res.json({ message: 'Reset email sent' });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const { data: record } = await supabase
    .from('kb_password_resets')
    .select()
    .eq('token', token)
    .single();

  if (!record || new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await supabase
    .from('kb_users')
    .update({ password_hash: hash })
    .eq('id', record.user_id);

  await supabase
    .from('kb_password_resets')
    .delete()
    .eq('id', record.id);

  res.json({ message: 'Password reset successful' });
};
