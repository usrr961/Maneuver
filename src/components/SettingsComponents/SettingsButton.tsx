import React from "react";

/**
 * A component consisting of a button that displays a question and toggles the given state when clicked.
 *
 * @param {number} width - The width of the button.
 * @param {number} height - The height of the button.
 * @param {string} question - The question to be displayed on the button.
 * @param {boolean} state - The current state of the button.
 * @param {function} setState - A function to update the state of the button.
 * @return {JSX.Element} The rendered button component.
 */
const SettingsButton = ({
  width = 90,
  height = 15,
  question = "Question",
  state,
  setState,
}) => {
  return (
    <>
      <button
        className="flex h-full w-full border-8 border-[#1D1E1E] bg-[#4A4A4A] rounded-xl justify-center items-center whitespace-pre-wrap break-words text-white font-bold ~text-2xl/5xl text-center ~p-2/8"
        onClick={() => setState(!state)} // Toggles the state when the button is clicked
      >
        {question}
      </button>
    </>
  );
};

export default SettingsButton;
