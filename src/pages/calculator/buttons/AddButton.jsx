import {
    PlusOutlined
} from "@ant-design/icons";

export default function AddButton(props) {
    return (
        <button onClick={props.add}>
            <PlusOutlined /><span>{' '+props.label}</span>
        </button>
    );
}