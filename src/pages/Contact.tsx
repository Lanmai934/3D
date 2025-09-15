import React, { useState, useMemo, useCallback } from 'react';
import { cacheManager } from '../utils/cacheManager';
import { 
  motion
} from '../utils/motionShared';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 性能监控已移除以优化代码
    
    // 模拟表单提交
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // 缓存成功提交的表单数据（用于表单恢复）
      cacheManager.set('lastSuccessfulSubmit', {
        timestamp: Date.now(),
        formData: { ...formData }
      }, 24 * 60 * 60 * 1000); // 24小时
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  }, [formData]);

  const contactInfo = useMemo(() => [
    {
      icon: '📧',
      title: '邮箱',
      value: '13298382579@163.com',
      link: 'mailto:13298382579@163.com'
    },
    {
      icon: '📱',
      title: '电话',
      value: '+86 132 9838 2579',
      link: 'tel:+8613298382579'
    },
    {
      icon: '📍',
      title: '位置',
      value: '中国 · 北京',
      link: '#'
    },
    {
      icon: '🌐',
      title: '网站',
      value: 'www.3dportfolio.com',
      link: 'https://www.3dportfolio.com'
    }
  ], []);

  const socialLinks = useMemo(() => [
    { name: 'GitHub', icon: '🐙', url: 'https://github.com' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
    { name: 'Dribbble', icon: '🏀', url: 'https://dribbble.com' }
  ], []);

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
          {/* 3D背景已移除以优化性能 */}
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">联系我</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            有项目想法或合作机会？让我们一起创造令人惊叹的3D体验
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              className="glass p-8 rounded-2xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">发送消息</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    id="name"
                    name="name"
                    type="text"
                    label="姓名 *"
                    placeholder="您的姓名"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <FormField
                    id="email"
                    name="email"
                    type="email"
                    label="邮箱 *"
                    placeholder="您的邮箱"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <FormField
                  id="subject"
                  name="subject"
                  type="text"
                  label="主题 *"
                  placeholder="消息主题"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
                
                <FormField
                  id="message"
                  name="message"
                  type="textarea"
                  label="消息 *"
                  placeholder="请详细描述您的项目需求或想法..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                />
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      发送中...
                    </>
                  ) : (
                    '发送消息'
                  )}
                </motion.button>
                
                {submitStatus === 'success' && (
                  <motion.div
                    className="text-green-400 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ✅ 消息发送成功！我会尽快回复您。
                  </motion.div>
                )}
                
                {submitStatus === 'error' && (
                  <motion.div
                    className="text-red-400 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ❌ 发送失败，请稍后重试。
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">联系信息</h2>
                <p className="text-gray-300 mb-8">
                  随时欢迎您的咨询和合作邀请。无论是技术讨论、项目合作还是创意交流，
                  我都很乐意与您沟通。
                </p>
              </div>
              
              {/* Contact Details */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <ContactInfoCard
                    key={`${info.title}-${index}`}
                    info={info}
                    index={index}
                  />
                ))}
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">社交媒体</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <SocialLink
                      key={`${social.name}-${index}`}
                      social={social}
                    />
                  ))}
                </div>
              </div>
              
              {/* Availability */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-white">工作状态</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">目前可接受新项目</span>
                </div>
                <p className="text-gray-300 text-sm">
                  响应时间：通常在24小时内回复
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

// 记忆化表单字段组件
interface FormFieldProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'textarea';
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

const FormField = React.memo<FormFieldProps>(({ 
  id, name, type, label, placeholder, value, onChange, required, rows 
}) => {
  const inputClassName = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors";
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows || 4}
          className={`${inputClassName} resize-none`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClassName}
          placeholder={placeholder}
        />
      )}
    </div>
  );
});

// 记忆化联系信息卡片组件
interface ContactInfoCardProps {
  info: {
    icon: string;
    title: string;
    value: string;
    link: string;
  };
  index: number;
}

const ContactInfoCard = React.memo<ContactInfoCardProps>(({ info, index }) => (
  <motion.a
    href={info.link}
    className="glass p-4 rounded-xl flex items-center space-x-4 hover:bg-white/10 transition-all duration-300 block"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08 }} // 优化动画时长
    viewport={{ once: true, margin: "-30px" }} // 优化视口检测
    whileHover={{ scale: 1.02 }}
  >
    <div className="text-2xl">{info.icon}</div>
    <div>
      <h3 className="font-semibold text-white">{info.title}</h3>
      <p className="text-gray-300">{info.value}</p>
    </div>
  </motion.a>
));

// 记忆化社交链接组件
interface SocialLinkProps {
  social: {
    name: string;
    icon: string;
    url: string;
  };
}

const SocialLink = React.memo<SocialLinkProps>(({ social }) => (
  <motion.a
    href={social.url}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 glass rounded-lg flex items-center justify-center text-xl hover:bg-white/20 transition-all duration-300"
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
    title={social.name}
  >
    {social.icon}
  </motion.a>
));

export default Contact;