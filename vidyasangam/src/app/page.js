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
        <p className="text-center font-roboto">
          Empowering mentors to guide, and mentees to grow. Learn and develop
          together.
        </p>
      </div>

      {/* Vision Section */}
      <div>
        <p className="text-[#946f43] text-2xl text-center font-semibold font-comfortaa pt-[50px]">
          Vision of the Platform
        </p>
        <p className="text-center font-roboto">
          To create a supportive environment where experienced mentors help
          students grow by sharing industry insights and guiding them through
          their learning journeys.
        </p>
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
        <p className="mt-10 font-josefinSans text-2xl">
          Have Questions about the Program?
        </p>
        <p className="font-josefinSans">
          Feel free to reach out to us for more information.
        </p>

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
