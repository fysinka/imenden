import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ProductCarousel from './ProductCarousel';

export default function Layout() {
  const location = useLocation();
  const hideCarouselOn = ['/cart', '/checkout'];
  const showCarousel = !hideCarouselOn.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showCarousel && <ProductCarousel />}
      <Footer />
    </div>
  );
}
