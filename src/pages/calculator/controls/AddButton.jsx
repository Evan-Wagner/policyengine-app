import {
    PlusOutlined
} from "@ant-design/icons";
import { Button } from "antd";

export default function AddButton(props) {
    return (
        <Button style={props.style || {width: "auto"}} onClick={props.add}>
            <PlusOutlined /><span>{' '+props.label}</span>
        </Button>
    );
}