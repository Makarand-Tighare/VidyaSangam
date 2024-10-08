import Image from "next/image";
import NavBar from "./components/navBar";
import FancyTestimonialsSlider from "./components/fancy-testimonials-slider";
import testimonialData from "./data/testimonial.data";

import Linkedin from "./images/linkedin.png";
import Twitter from "./images/x.png";
import Instagram from "./images/insta.png";

export default function Home() {
  return (
    <div className="overflow-x-hidden p-2">
      {/* Navigation Bar */}
      <NavBar />

      {/* Header Section */}
      <div className="py-5 mt-20">
        <p className="text-[#946f43] text-4xl text-center font-semibold font-comfortaa pt-5">
          VidyaSangam Mentor-Mentee Platform
        </p>
        <p className="text-center font-roboto mt-1">
          Empowering mentors to guide, and mentees to grow. Learn and develop together.
        </p>
      </div>

      {/* Vision Section */}
      <div>
        <p className="text-[#946f43] text-2xl text-center font-semibold font-comfortaa pt-[50px]">
          Vision of the Platform
        </p>
        <p className="text-center font-roboto">
          To create a supportive environment where experienced mentors help students grow by sharing industry insights and guiding them through their learning journeys.
        </p>
      </div>

      {/* Features Section */}
<div className="mt-12">
  <p className="text-[#946f43] text-3xl text-center font-bold font-comfortaa">
    Key Features of VidyaSangam
  </p>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 px-5">
    {/* Feature 1 */}
    <div className="flex flex-col items-center">
      <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v-4m0 4l-2-2m0 0l2-2m2 2l-2 2m2-2v4m0-4h-4" />
        </svg>
      </div>
      <p className="text-lg font-semibold mt-4 text-center">Mentor-Mentee Pairing</p>
      <p className="text-center text-gray-500 mt-2">
        Comprehensive pairing based on academic and career goals.
      </p>
    </div>
    {/* Feature 2 */}
    <div className="flex flex-col items-center">
      <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l4 4m0 0l4-4m-4 4V4" />
        </svg>
      </div>
      <p className="text-lg font-semibold mt-4 text-center">Progress Tracking</p>
      <p className="text-center text-gray-500 mt-2">
        Structured mentoring sessions with progress tracking for growth.
      </p>
    </div>
    {/* Feature 3 */}
    <div className="flex flex-col items-center">
      <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4-4m0 0l4 4m-4-4v16" />
        </svg>
      </div>
      <p className="text-lg font-semibold mt-4 text-center">Workshops & Webinars</p>
      <p className="text-center text-gray-500 mt-2">
        Access to industry insights, workshops, and live webinars.
      </p>
    </div>
    {/* Feature 4 */}
    <div className="flex flex-col items-center">
      <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11l-7 7-7-7" />
        </svg>
      </div>
      <p className="text-lg font-semibold mt-4 text-center">Guided Learning</p>
      <p className="text-center text-gray-500 mt-2">
        Personalized learning paths with advice from professionals.
      </p>
    </div>
    {/* Feature 5 */}
    <div className="flex flex-col items-center">
      <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </div>
      <p className="text-lg font-semibold mt-4 text-center">Networking Opportunities</p>
      <p className="text-center text-gray-500 mt-2">
        Network with peers and industry leaders for career growth.
      </p>
    </div>

    {/* Feature 6 */}
<div className="flex flex-col items-center">
  <div className="bg-[#4f83f8] p-4 rounded-full shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
    </svg>
  </div>
  <p className="text-lg font-semibold mt-4 text-center">Automatic LinkedIn Integration</p>
  <p className="text-center text-gray-500 mt-2">
    Seamlessly integrate your profile and share your achievements directly on LinkedIn.
  </p>
</div>

  </div>
</div>


      {/* Mentor-Mentee Form Link */}
      <div className="text-center mt-12">
        <a 
          href="/mentoring-form" 
          className="bg-[#4f83f8] hover:bg-[#357ae8] text-white font-semibold py-2 px-5 rounded-lg">
          Sign Up for Mentor/Mentee Classification
        </a>
      </div>

      {/* Testimonials Section */}
      <div>
        <p className="text-[#946f43] text-2xl text-center font-semibold font-comfortaa pt-[50px]">
          Testimonials
        </p>
        <div className="mt-5">
          <FancyTestimonialsSlider testimonials={testimonialData} />
        </div>
      </div>

      {/* Contact Us */}
      <div className="text-center pb-32 mt-18">
        <p className="text-[#946f43] text-4xl text-center font-semibold font-comfortaa pt-[50px]">
          Get in Touch
        </p>
        <p className="mt-10 font-josefinSans text-2xl">Have Questions about the Program?</p>
        <p className="font-josefinSans">Feel free to reach out to us for more information.</p>

        <div className="flex flex-row justify-center align-middle mt-5">
          <a
            href="https://www.linkedin.com/school/officialycce"
            className="mx-5"
          >
            <Image
              src={Linkedin}
              width={30}
              height={30}
              alt="VidyaSangam LinkedIn"
            />
          </a>
          <a href="https://x.com/ycceofficial" className="mx-5">
            <Image
              src={Twitter}
              width={30}
              height={30}
              alt="AIGuruKul Twitter"
            />
          </a>
          <a href="https://www.instagram.com/ctsc_ycce" className="mx-5">
            <Image
              src={Instagram}
              width={30}
              height={30}
              alt="VidyaSangam Instagram"
            />
          </a>
        </div>

        <p className="text-[#946f43] text-3xl text-center font-semibold font-comfortaa pt-10">
          VidyaSangam
        </p>
        <p className="font-josefinSans">Department of Computer Technology</p>
        <p className="font-josefinSans">
          Yeshwantrao Chavan College of Engineering
        </p>
        <a
          href="mailto:VidyaSangam.edu@gmail.com"
          className="text-[#946f43] font-comfortaa "
        >
          VidyaSangam.edu@gmail.com
        </a>
      </div>
    </div>
  );
}
