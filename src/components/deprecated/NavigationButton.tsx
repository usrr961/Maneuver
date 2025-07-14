import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

//import { toast } from "react-toastify";

interface NavigationButtonProps {
    destination?: string;
    className?: string;
    variant?: "secondary" | "destructive" | "outline" | "ghost" | "link" | "default" | null;
    children: React.ReactNode;
}

const NavigationButton = ({
    destination,
    className = "h-fit flex items-center",
    variant = "default",
    children,
}: NavigationButtonProps) => {


    const navigate = useNavigate();

  // navigate to the destination page
    const proceedClick = () => {
        if (destination) {
        // If a destination is provided, navigate to that page
        navigate(destination);
        } else {
        // If no destination is provided, navigate to the root page
        navigate("/");
        }
    };

    return (
        <Button
            variant={variant}
            onClick={proceedClick}
            className={className}
        >
            {children}
        </Button>
    );
};

export default NavigationButton;
