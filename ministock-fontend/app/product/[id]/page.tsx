import { redirect } from 'next/navigation';

export default function ProductDetailRedirect() {
  redirect('/products');
}
