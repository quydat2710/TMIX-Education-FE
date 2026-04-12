import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { getHomeBannersAPI } from '../../../../services/advertisements';
import { Advertisement } from '../../../../types';
import { useBannerConfig } from '../../../../hooks/useBannerConfig';
import AdvertisementSlider from '../../../../components/features/advertisement/AdvertisementSlider';
import ClassRegistrationModal from '../../../../components/features/home/ClassRegistrationModal';
import HeroSection from '../HeroSection';

const BannerCarousel: React.FC = () => {
  const { bannerConfig } = useBannerConfig();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHomeBannersAPI(10);

        let bannerAds: any[] = [];
        if (response.data?.data?.result) {
          bannerAds = response.data.data.result;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          bannerAds = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          bannerAds = (response.data as any).result || (response.data as any).advertisements || [];
        } else if (Array.isArray(response.data)) {
          bannerAds = response.data;
        }

        const normalizedBanners: Advertisement[] = bannerAds.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          content: ad.content || ad.description,
          imageUrl: ad.imageUrl,
          image: ad.imageUrl,
          priority: ad.priority,
          createdAt: ad.createdAt,
          type: ad.type,
          isActive: ad.isActive,
          classId: ad.classId || null,
        }));

        const activeBanners = normalizedBanners.filter((ad) => ad.isActive !== false);
        setAdvertisements(activeBanners.slice(0, bannerConfig.maxSlides));
      } catch (err) {
        console.error('[BannerCarousel] Error fetching advertisements:', err);
        setError('error');
        setAdvertisements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [bannerConfig.maxSlides]);

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ height: bannerConfig.height, position: 'relative' }}>
        <Skeleton variant="rectangular" height="100%" animation="wave" />
      </Box>
    );
  }

  // Fallback: no banners or banner feature disabled → show beautiful static hero
  if (error || advertisements.length === 0 || !bannerConfig.isActive) {
    return <HeroSection />;
  }

  const handleRegisterClick = (classId: string | null, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setModalOpen(true);
  };

  return (
    <>
      <AdvertisementSlider
        ads={advertisements}
        autoPlay={bannerConfig.autoPlay}
        interval={bannerConfig.interval}
        showArrows={bannerConfig.showArrows}
        showDots={bannerConfig.showDots}
        height={bannerConfig.height}
        onRegisterClick={handleRegisterClick}
      />

      <ClassRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </>
  );
};

export default BannerCarousel;
