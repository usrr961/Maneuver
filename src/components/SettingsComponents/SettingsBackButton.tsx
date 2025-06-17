import { useNavigate } from "react-router-dom";

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
const SettingsBackButton = ({
    route
}) => {
    const navigate = useNavigate();
    
    return (
        <>
            <div className="p-4">
                <button
                    className="flex items-center w-fit justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#242424] text-white font-bold ~text-2xl/5xl text-center py-2 px-4"
                    onClick={() => {
                        navigate(route);
                    }}
                >
                Back
                </button>
            </div>
        </>
    );
};

export default SettingsBackButton;
