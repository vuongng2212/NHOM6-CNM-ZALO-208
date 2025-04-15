import  React  from "react";
import { Container, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";


const ContainerStyled = styled(Container)`
    display: flex;
    justify-content:center;
`

const FormGroupStyled = styled(Form.Group)`
    margin-bottom: 2rem;
    text-align: center;
`

const NewPassword =() => {

    return (
        <ContainerStyled fluid="md">
            <Form style={{width:"40%"}}>
                <FormGroupStyled>
                    <h3>Đặt lại mật khẩu</h3>
                </FormGroupStyled>

                <FormGroupStyled>
                    <Form.Control size="lg" type="text"
                        name="newPassword"
                        placeholder="Nhập mật khẩu mới"
                        // value={formData.resetPasswordPhone}
                        // onChange={handleChange}
                    />
                </FormGroupStyled>

                <FormGroupStyled>
                    <Form.Control size="lg" type="text"
                        name="newPasswordConfirm"
                        placeholder="Nhập lại mật khẩu mới"
                        // value={formData.resetPasswordPhone}
                        // onChange={handleChange}
                    />
                </FormGroupStyled>

                <FormGroupStyled>
                    <Button variant="primary" type="submit">
                            Xác nhận
                    </Button>
                </FormGroupStyled>
            </Form>
        </ContainerStyled>
        )
}

export default NewPassword;