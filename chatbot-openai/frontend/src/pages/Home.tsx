import Footer from "../components/footer/Footer";
import TypingAnim from "../components/typer/TypingAnim";

const Home = () => {
  return (
    <main className="w-full min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <section className="flex flex-col items-center px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Typing animation */}
        <div className="mt-6 text-center">
          <TypingAnim />
        </div>

        {/* Robot and OpenAI logos */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 my-16">
          <img src="robot.png" alt="robot" className="w-40 md:w-52 mx-auto" />
          <img
            src="openai.png"
            alt="openai"
            className="w-40 md:w-52 mx-auto invert dark:invert-0 animate-rotate"
          />
        </div>

        {/* Chat preview image */}
        <div className="flex justify-center w-full">
          <img
            src="chat.png"
            alt="chatbot"
            className="w-4/5 md:w-3/5 rounded-2xl shadow-[0px_0px_80px_#64f3d5] p-4 mt-10 mb-10"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Home;
