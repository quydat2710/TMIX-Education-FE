import { useState, useEffect } from 'react';

export interface FooterSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  zaloUrl?: string;
  description?: string;
  mapEmbedUrl?: string; // Google Maps embed URL (always shown if provided)
}

export const useFooterSettings = () => {
  // Default configuration - CẤU HÌNH MẶC ĐỊNH
  // 👇 SỬA Ở ĐÂY để thay đổi thông tin footer 👇
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'TMix Education',
    email: 'info@tmixeducation.com',
    phone: '097.773.0167 - 098.681.9955',
    address: 'CS1: 6/111 An Trai, Hoài Đức | CS2: Mỹ Đình | CS3: Cầu Giấy | CS4: Bắc Từ Liêm | CS5: Dịch Vọng',
    description: 'Trung tâm đào tạo chất lượng cao - Kiến tạo tương lai',
    facebookUrl: 'https://www.facebook.com/TMixEducationdichvong',
    youtubeUrl: 'https://youtube.com/@tmixeducation',
    zaloUrl: 'https://zalo.me/0986819955',
    // CHỈ LẤY LINK src="..." THÔI, không lấy cả thẻ <iframe>
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.845329404923!2d105.79187597516471!3d21.03887388743127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab39d2cb8ff1%3A0xfc674f144c553f2e!2zNSBQLiBOZ3V54buFbiDEkOG7lyBDdW5nLCBE4buLY2ggVuG7jW5nLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSAxMDAwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1768790738363!5m2!1svi!2s'
  });

  // Load configuration from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('footerSettings');

        if (savedSettings) {
          setFooterSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading footer settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save configuration to localStorage
  const saveFooterSettings = (settings: FooterSettings) => {
    try {
      localStorage.setItem('footerSettings', JSON.stringify(settings));
      setFooterSettings(settings);
    } catch (error) {
      console.error('Error saving footer settings:', error);
      throw error;
    }
  };

  return {
    footerSettings,
    saveFooterSettings
  };
};
