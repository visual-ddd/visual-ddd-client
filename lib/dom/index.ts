export function scrollIntoView(select: string) {
  const element = document.querySelector(select);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
