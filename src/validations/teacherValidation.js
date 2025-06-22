// Validate teacher add form
export function validateTeacher({ name, email, password, dayOfBirth, phone, address, salaryPerLesson, qualifications, specialization }, isUpdate = false) {
  const errors = {};

  // Name
  if (!name || !name.trim()) {
    errors.name = 'Họ tên là bắt buộc';
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Email không hợp lệ';
  }

  // Password: min 8, có cả chữ và số (chỉ bắt buộc khi tạo mới)
  if (!isUpdate) {
    if (!password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.password = 'Mật khẩu phải chứa cả chữ và số';
    }
  }

  // Phone: 10 số, bắt đầu bằng 0
  const phoneRegex = /^0\d{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.phone = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
  }

  // Ngày sinh: đúng định dạng DD/MM/YYYY và bé hơn ngày hiện tại
  const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dayOfBirth || !dobRegex.test(dayOfBirth)) {
    errors.dayOfBirth = 'Ngày sinh phải đúng định dạng DD/MM/YYYY';
  } else {
    // Kiểm tra nhỏ hơn ngày hiện tại
    const [d, m, y] = dayOfBirth.split('/').map(Number);
    const dob = new Date(y, m - 1, d);
    const now = new Date();
    if (dob >= now) {
      errors.dayOfBirth = 'Ngày sinh phải nhỏ hơn ngày hiện tại';
    }
  }

  // Address
  if (!address || !address.trim()) {
    errors.address = 'Địa chỉ là bắt buộc';
  }

  // Salary per lesson (chỉ bắt buộc khi tạo mới)
  if (!isUpdate) {
    if (!salaryPerLesson) {
      errors.salaryPerLesson = 'Lương/buổi là bắt buộc';
    } else if (isNaN(salaryPerLesson) || Number(salaryPerLesson) <= 0) {
      errors.salaryPerLesson = 'Lương/buổi phải là số dương';
    } else if (Number(salaryPerLesson) < 100) {
      errors.salaryPerLesson = 'Lương/buổi phải ít nhất 100 nghìn VNĐ';
    }
  }

  // Qualifications (chỉ bắt buộc khi tạo mới)
  if (!isUpdate) {
    if (!qualifications || !qualifications.trim()) {
      errors.qualifications = 'Bằng cấp là bắt buộc';
    } else {
      const quals = qualifications.split(',').map(q => q.trim()).filter(q => q);
      if (quals.length === 0) {
        errors.qualifications = 'Phải nhập ít nhất một bằng cấp';
      }
    }
  }

  // Specialization (chỉ bắt buộc khi tạo mới)
  if (!isUpdate) {
    if (!specialization || !specialization.trim()) {
      errors.specialization = 'Chuyên môn là bắt buộc';
    } else {
      const specs = specialization.split(',').map(s => s.trim()).filter(s => s);
      if (specs.length === 0) {
        errors.specialization = 'Phải nhập ít nhất một chuyên môn';
      }
    }
  }

  return errors;
}
