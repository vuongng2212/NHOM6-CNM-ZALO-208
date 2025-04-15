import { React } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";
import { icons } from "../assets";

const BenefitStyled = styled.div`
    font-size: 30px;
    line-height: 70px;
`

const IconCheckStyled = styled.img`
    width: 1em; /* Kích thước bằng với font-size */
    height: 1em;
    margin-right: 0.5em; /* Để tạo khoảng cách giữa biểu tượng và nội dung khác */
`

const Benefit =()=> {
    // return (
    //     <BenefitStyled>
    //         <p>
    //             <IconCheckStyled src={icons.checkIcon} alt="Checked Icon"></IconCheckStyled>
    //              Gửi file, ảnh, video cực nhanh</p>
    //         <p>
    //             <IconCheckStyled src={icons.checkIcon} alt="Checked Icon"></IconCheckStyled>
    //              Đồng bộ tin nhắn với điện thoại</p>
    //         <p>
    //             <IconCheckStyled src={icons.checkIcon} alt="Checked Icon"></IconCheckStyled>
    //             Tối ưu cho chat nhóm và trao đổi công việc</p>
    //     </BenefitStyled>
    // )
}

export default Benefit;