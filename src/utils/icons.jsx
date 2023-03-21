const DragHandle = (props) => {
    const { className = "icon", ...rest } = props;

    return (
        <svg
            {...rest}
            className={className}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                d="M8,18 C9.1045695,18 10,18.8954305 10,20 C10,21.1045695 9.1045695,22 8,22 C6.8954305,22 6,21.1045695 6,20 C6,18.8954305 6.8954305,18 8,18 Z M16,18 C17.1045695,18 18,18.8954305 18,20 C18,21.1045695 17.1045695,22 16,22 C14.8954305,22 14,21.1045695 14,20 C14,18.8954305 14.8954305,18 16,18 Z M8,10 C9.1045695,10 10,10.8954305 10,12 C10,13.1045695 9.1045695,14 8,14 C6.8954305,14 6,13.1045695 6,12 C6,10.8954305 6.8954305,10 8,10 Z M16,10 C17.1045695,10 18,10.8954305 18,12 C18,13.1045695 17.1045695,14 16,14 C14.8954305,14 14,13.1045695 14,12 C14,10.8954305 14.8954305,10 16,10 Z M8,2 C9.1045695,2 10,2.8954305 10,4 C10,5.1045695 9.1045695,6 8,6 C6.8954305,6 6,5.1045695 6,4 C6,2.8954305 6.8954305,2 8,2 Z M16,2 C17.1045695,2 18,2.8954305 18,4 C18,5.1045695 17.1045695,6 16,6 C14.8954305,6 14,5.1045695 14,4 C14,2.8954305 14.8954305,2 16,2 Z"
            />
        </svg>
    );
};

const RectangleTool = (props) => {
    const { className = "icon stroked-icon", stroke = "#fff", ...rest } = props;

    return (
        <svg
            className={className}
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke={stroke}
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
        </svg>
    );
};

const ArrowUpLeft = (props) => {
    const { className = "icon stroked-icon", stroke = "#fff", ...rest } = props;

    return (
        <svg
            className={className}
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={stroke}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 19.5l-15-15m0 0v11.25m0-11.25h11.25"
            />
        </svg>
    );
};

const CursorPointer = (props) => {
    const { className = "icon stroked-icon", stroke = "#fff", ...rest } = props;

    return (
        <svg
            className={className}
            {...rest}
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                clip-rule="evenodd"
                d="M19.503 9.97c1.204.489 1.112 2.224-.137 2.583l-6.306 1.813-2.88 5.895c-.57 1.168-2.295.957-2.568-.314L4.677 6.257A1.369 1.369 0 016.53 4.7L19.503 9.97z"
                stroke-width="1.5"
            ></path>
        </svg>
    );
};

const Spline = (props) => {
    const { className, ...rest } = props;
    return (
        <svg
            className={`icon${className ? " " + className : ""}`}
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            strokeWidth={0.5}
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M6.457 18.957l8.564-8.564-1.414-1.414-8.564 8.564 1.414 1.414zm5.735-11.392l-1.414-1.414 1.414-1.414 1.768 1.767 2.829-2.828a1 1 0 0 1 1.414 0l2.121 2.121a1 1 0 0 1 0 1.414l-2.828 2.829 1.767 1.768-1.414 1.414-1.414-1.414L7.243 21H3v-4.243l9.192-9.192z" />
        </svg>
    );
};

const Screenshot = (props) => {
    const { className, ...rest } = props;

    return (
        <svg
            className={`icon${className ? " " + className : ""}`}
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm0 4h2v2h-2V7zM3 19h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3V7zm7.667 4l1.036-1.555A1 1 0 0 1 12.535 9h2.93a1 1 0 0 1 .832.445L17.333 11H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2.667zM9 19h10v-6h-2.737l-1.333-2h-1.86l-1.333 2H9v6zm5-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
    );
};

const DragDrop = (props) => {
    const { className, ...rest } = props;
    let src = "Remix";

    return (
        <svg
            className={`icon${className ? " " + className : ""}`}
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
        </svg>
    );
};

export {
    ArrowUpLeft,
    DragDrop,
    DragHandle,
    CursorPointer,
    RectangleTool,
    Spline,
    Screenshot,
};
