import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Avatar,
  TextField,
  Button,
} from '@mui/material';
import { commonStyles } from '../../utils/styles';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import AdvertisementSlider from '../../components/advertisement/AdvertisementSlider';
import WelcomeAdPopup from '../../components/advertisement/WelcomeAdPopup';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getAllAnnouncementsAPI } from '../../services/api';

const teachers = [
  {
    id: 1,
    name: 'Hoàng Thị Mai',
    role: 'Giáo viên tiếng Anh Tiểu học',
    experience: '8 năm giảng dạy học sinh lớp 1-5',
    education: 'Cử nhân Sư phạm Tiếng Anh, ĐH Sư phạm Hà Nội',
    image: '/images/anh-1.png',
    description: 'Tận tâm, sáng tạo, giúp học sinh nhỏ tuổi yêu thích tiếng Anh qua các hoạt động vui nhộn, tương tác.'
  },
  {
    id: 2,
    name: 'Phạm Quang Duy',
    role: 'Giáo viên tiếng Anh THCS',
    experience: '5 năm giảng dạy học sinh lớp 6-9',
    education: 'Cử nhân Ngôn ngữ Anh, ĐH Ngoại ngữ - ĐHQGHN',
    image: '/images/ang-chin-yong.webp',
    description: 'Chuyên xây dựng nền tảng vững chắc về ngữ pháp, phát âm và giao tiếp cho học sinh cấp 2, giúp các em tự tin sử dụng tiếng Anh.'
  },
  {
    id: 3,
    name: 'Đỗ Thị Hoa',
    role: 'Giáo viên tiếng Anh THPT & luyện thi',
    experience: '6 năm luyện thi tiếng Anh cho học sinh lớp 10-12',
    education: 'Thạc sĩ Giảng dạy Tiếng Anh, ĐH Hà Nội',
    image: '/images/anh-3.png',
    description: 'Kinh nghiệm luyện thi vào 10, tốt nghiệp THPT, IELTS cho học sinh phổ thông. Phương pháp học tập trung, hiệu quả, truyền cảm hứng.'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const [ads, setAds] = useState([]);
  const [popupAds, setPopupAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);

  useEffect(() => {
    const adShown = sessionStorage.getItem('welcomeAdShown');
    if (!adShown) {
      const timer = setTimeout(() => {
        setShowWelcomeAd(true);
      }, 1000); // Hiển thị sau 2 giây
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    getAllAnnouncementsAPI()
      .then(res => {
        setAds(res.data || []);
        setPopupAds((res.data || []).filter(ad => ad.displayType === 'popup'));
        setBannerAds((res.data || []).filter(ad => ad.displayType === 'banner'));
      });
  }, []);

  const handleCloseWelcomeAd = () => {
    sessionStorage.setItem('welcomeAdShown', 'true');
    setShowWelcomeAd(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb' }}>
      {/* Quảng cáo popup động */}
      {popupAds.length > 0 && (
      <WelcomeAdPopup
        open={showWelcomeAd}
        onClose={handleCloseWelcomeAd}
          ad={popupAds[0]} // hoặc random nếu muốn
      />
      )}
      <HomeHeader sx={{ bgcolor: '#fff', borderBottom: '1px solid #eee' }} />
      <Box sx={{ width: '100%' }}>
          <Box id="hero-section"
            sx={{
              position: 'relative',
              height: '580px',
              borderRadius: 0,
              mb: 0,
              pt: 7.8,
            }}
          >
            <Box
              component="img"
              src="/images/Banner-tieng-Anh.png"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 0,
              }}
            />
          </Box>
        <Box sx={{ ...commonStyles.contentContainer, px: '8%' }}>
          {/* Hero Section */}

          {/* Chữ dưới ảnh hero */}
          <Box sx={{
            width: '100%',
            bgcolor: '#fff',
                textAlign: 'center',
            py: 4,
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                Chào mừng đến với Trung tâm Anh ngữ
              </Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Nơi ươm mầm tài năng, phát triển tương lai
              </Typography>
          </Box>

          {/* About Section - now 4 columns */}
          <Box id="about-section" sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Về chúng tôi
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              align="center"
              sx={{ mb: 6 }}
            >
              Tìm hiểu thêm về English Center
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Sứ mệnh</Typography>
                  <Typography paragraph>
                    Chúng tôi cam kết mang đến chất lượng đào tạo tiếng Anh tốt nhất, giúp học viên tự tin giao tiếp và đạt được mục tiêu học tập của mình.
                  </Typography>
                  <Typography paragraph>
                    Mỗi học viên đều được quan tâm sát sao, xây dựng lộ trình học tập cá nhân hóa phù hợp với năng lực và mục tiêu riêng.
                  </Typography>
                  <Typography paragraph>
                    Chúng tôi không ngừng đổi mới phương pháp giảng dạy để truyền cảm hứng học tập và phát triển toàn diện cho học sinh từ lớp 1 đến lớp 12.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Tầm nhìn</Typography>
                  <Typography paragraph>
                    Trở thành trung tâm đào tạo tiếng Anh hàng đầu, được tin tưởng bởi học viên và đối tác trên toàn quốc.
                  </Typography>
                  <Typography paragraph>
                    Xây dựng môi trường học tập hiện đại, thân thiện, nơi mọi học sinh đều có cơ hội phát triển kỹ năng tiếng Anh và kỹ năng sống.
                  </Typography>
                  <Typography paragraph>
                    Định hướng phát triển lâu dài, mở rộng hệ thống và hợp tác quốc tế để mang lại nhiều giá trị hơn cho cộng đồng học sinh Việt Nam.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Giá trị cốt lõi</Typography>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Chất lượng đào tạo xuất sắc, lấy học viên làm trung tâm.</li>
                    <li>Đội ngũ giáo viên chuyên nghiệp, tận tâm, sáng tạo.</li>
                    <li>Phương pháp giảng dạy hiện đại, cập nhật liên tục.</li>
                    <li>Môi trường học tập thân thiện, khuyến khích sự chủ động.</li>
                    <li>Hỗ trợ học viên tận tâm, đồng hành cùng phụ huynh.</li>
                  </Typography>
                  <Typography paragraph>
                    Chúng tôi tin rằng mỗi học sinh đều có tiềm năng riêng và xứng đáng được phát triển tối đa trong môi trường giáo dục chất lượng.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>Lịch sử phát triển</Typography>
                  <Typography paragraph>
                    English Center được thành lập năm 2010 với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.
                  </Typography>
                  <Typography paragraph>
                    Trải qua hơn 10 năm phát triển, chúng tôi đã đào tạo hơn 10,000 học viên, mở rộng hệ thống cơ sở trên toàn quốc và trở thành đối tác tin cậy của nhiều trường học, doanh nghiệp.
                  </Typography>
                  <Typography paragraph>
                    Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho mọi học viên, từ lớp 1 đến lớp 12.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Advertisement Banner động */}
          <Box sx={{ mb: 6 }}>
            <AdvertisementSlider ads={bannerAds} />
          </Box>

          {/* Teachers Section */}
          <Box id="teachers-section" sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Đội ngũ giảng viên
            </Typography>

              {/* Section 3 giá trị cốt lõi */}
              <Box sx={{ mb: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>Chuyên môn giỏi</Typography>
                      <Typography color="black" sx={{ textAlign: 'justify' }}>
                        Đội ngũ giáo viên chuyên môn giỏi, xuất thân từ các các trường học uy tín hàng đầu quốc tế hoặc trường ngoại ngữ có tiếng tại Việt Nam, đồng thời sở hữu chứng chỉ TESOL với phương pháp và kỹ năng giảng dạy chuyên sâu. Bên cạnh đó giáo viên của chúng tôi được tinh tuyển, đào tạo khắt khe, áp dụng đồng bộ phương pháp RIPL trong giảng dạy, giúp học viên cán đích thành công.
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>Nhiệt tình</Typography>
                      <Typography color="black" sx={{ textAlign: 'justify' }}>
                        Đội ngũ giảng viên luôn lấy 5 giá trị cốt lõi làm kim chỉ nam cho mọi trường hợp: Tận tâm phục vụ, Trách nhiệm kỷ luật, Đổi mới sáng tạo, Dám nghĩ dám làm, Chính trực thẳng thắn. Thầy cô đặt hiệu quả học tập của học viên làm ưu tiên số 1 trong mọi suy nghĩ và hành động nên luôn cống hiến hết mình cho từng bài giảng để học viên đạt hiệu quả tiếp thu tối đa.
                      </Typography>
                    </Paper>
                  </Box>
                  <Box>
                    <Paper elevation={3} sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}>Sáng tạo</Typography>
                      <Typography color="black" sx={{ textAlign: 'justify' }}>
                        Giáo viên luôn chủ động nghiên cứu những phương pháp giảng dạy mới, sáng kiến trong nghề để mỗi bài giảng trở nên hấp dẫn và học trò tiếp thu hiệu quả hơn. Tâm niệm học những gì cần thiết, hữu ích chứ không học dàn trải tất cả những gì tiếng Anh có nên thầy cô luôn áp dụng cách học logic, thực hành tối đa, cùng học viên theo đuổi mục tiêu đến cùng.
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
            </Box>

            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Các giảng viên tiêu biểu
            </Typography>
            <Grid container spacing={4}>
              {teachers.map((teacher) => (
                <Grid item key={teacher.id} xs={12} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                      <CardMedia
                        component="img"
                        image={teacher.image}
                        alt={teacher.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                      >
                        {teacher.name}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        gutterBottom
                      >
                        {teacher.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {teacher.experience}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {teacher.education}
                      </Typography>
                      <Typography variant="body1" paragraph>{teacher.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>



        <Footer />
      </Box>
    </Box>
  );
};

export default Home;
