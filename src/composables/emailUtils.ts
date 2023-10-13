export const splitEmailAddress = (
  email: string,
): { localPart: string; domain: string } => {
  const regex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');
  if (!regex.test(email)) return { localPart: '', domain: '' };
  const [localPart, domain] = email.split('@');

  if (localPart && domain) {
    return { localPart, domain };
  } else {
    console.error('Invalid email address');
    return { localPart: '', domain: '' };
  }
};
