const soup = '0123456789abcdefghijklmnopqrstuvwxyz';

export default function (length = 32) {
  const id = [];
  for (let i = 0; i < length; i++) {
    id[i] = soup.charAt(Math.random() * soup.length);
  }
  return id.join('');
}
