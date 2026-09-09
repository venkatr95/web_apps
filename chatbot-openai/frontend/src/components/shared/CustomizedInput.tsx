type Props = {
  name: string;
  type: string;
  label: string;
};

const CustomizedInput = ({ name, type, label }: Props) => {
  return (
    <div className="flex flex-col space-y-1 w-full max-w-md">
      <label
        htmlFor={name}
        className="text-sm font-semibold text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="px-4 py-2 rounded-md border 
               border-gray-300 dark:border-gray-600 
               bg-white dark:bg-gray-800 text-black dark:text-white 
               focus:outline-none focus:ring-2 focus:ring-cyan-400 
               dark:focus:ring-cyan-600 transition-colors"
      />
    </div>
  );
};

export default CustomizedInput;
