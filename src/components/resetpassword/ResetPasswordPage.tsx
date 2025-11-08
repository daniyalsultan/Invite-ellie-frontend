import { useState } from 'react';
import forgetPasswordImage from '../../assets/forgetpassword.png';

export function ResetPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Reset password submitted', { email });
  };

  return (
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie flex justify-center">
        <div className="w-full max-w-[500px]">
          {/* Illustrative Graphic */}
          <div className="mb-8 flex justify-center">
            <img 
              src={forgetPasswordImage} 
              alt="Forgot password illustration" 
              className="h-auto w-full max-w-[250px] object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-center font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
            Reset your password
          </h1>

          {/* Instructional Text */}
          <p className="mt-3 text-center font-nunito text-[18px] leading-[1.5] text-ellieBlack lg:text-[22px]">
            Enter your email to receive a secure reset link.
          </p>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[12px] border border-[#7964A0] bg-white px-5 py-[14px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue lg:text-[20px]"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

