import React, { useContext, useState, useRef } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import Context from '@/Context/context';
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { QueryClient, useMutation } from "@tanstack/react-query";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
export default function JoinUsPage() {
	const initialValues = {
		email: "",
		password: "",
		username: "",
	};
	const validationSchema = Yup.object({
		email: Yup.string().email("Invalid Email Format").required("Required"),

		password: Yup.string().required("Required"),

		username: Yup.string().required("Required"),
	});
	const less = useLoginUser();
	const onSubmit = (values) => {
		less.mutate(values);
	};


	const initialValues2 = {
		email: "",
		password1: "",
		username: "",
		password2: "",
	};

	const validationSchema2 = Yup.object({
		email: Yup.string()
			.email("Invalid Email Format!")
			.required("Required!")
			.min(5, "Atleast 5 characters required!"),

		password1: Yup.string()
			.required("Required!")
			.matches(/^(?=.{6,})/, "Must Contain 6 Characters!")
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])/,
				"Must Contain One Uppercase, One Lowercase!"
			)
			.matches(
				/^(?=.*[!@#\$%\^&\*])/,
				"Must Contain One Special Case Character!"
			)
			.matches(/^(?=.{6,20}$)\D*\d/, "Must Contain One Number!"),

		username: Yup.string()
			.required("Required!")
			.min(5, "Atleast 5 characters required!"),

		password2: Yup.string()
			.required("Required!")
			.test("passwords-match", "Passwords must match!", function (value) {
				return this.parent.password1 === value;
			}),
	});

	const less2 = useCreateUser();
	const onSubmitSignup = (values) => {
		less2.mutate(values);
	};
	return (
		<div className='flex items-center justify-center !my-auto h-screen  py-auto '>


			<div className="container ">
				<input className='peer' type="checkbox" id="flip" />
				<div className="cover invert">
					<div className="front">

						<div className="form-link invert">
							<span className="img-text-1">Signup User <br /> Experience The <br />
								New Age App
							</span>
							<span className="img-text-2">Lets get connected</span>
						</div>
					</div>
					<div className="back">
						<div className="form-link">
							<span className="img-text-1">Zaur Suleymanovs <br /> new responsive <br />
								Login/Signup form
							</span>
							<span className="img-text-2">Lets get connected</span>
						</div>
					</div>
				</div>
				<div id="form">
					<div className="form-content">
						<div className="login-form">
							<div className="title">Login</div>
							<Formik
								initialValues={initialValues}
								validationSchema={validationSchema}
								onSubmit={onSubmit}
							>
								<Form>
									<div className="input-groups">
										<div className="input-box">
											<i className="fas fa-envelope"></i>
											<Field type="text" name="username" className="input" placeholder="Enter your Username" />
											<ErrorMessage name="username" component="div" className="error text-red-500" />
										</div>
									</div>
									<div className="input-groups">
										<div className="input-box">
											<i className="fas fa-envelope"></i>
											<Field type="email" name="email" className="input" placeholder="Enter your email" />
											<ErrorMessage name="email" component="div" className="error text-red-500" />
										</div>
									</div>


									<div className="input-groups">
										<div className="input-box">
											<i className="fa-solid fa-lock"></i>
											<Field type="password" name="password" className="input" placeholder="Enter your password" />
											<ErrorMessage name="password" component="div" className="error text-red-500" />
										</div>
									</div>

									

									

									<div className="input-groups">
										<div className="button input-box invert">
											<button type="submit">Submit</button>
										</div>
									</div>

									<div className="form-link login-text">
										<span>
											Dont have an account?{' '}
											<label className="link login-link invert" htmlFor="flip">
												Signup now
											</label>
										</span>
									</div>
								</Form>
							</Formik>
						</div>

						
						<div className="sign-form">
							<div className="title">Signup</div>
							<Formik
								initialValues={initialValues2}
								validationSchema={validationSchema2}
								onSubmit={onSubmitSignup}
							>
								<Form>
									<div className="input-groups">
										<div className="input-box">
											<i className="fas fa-user"></i>
											<Field type="text" name="username" className="input" placeholder="Enter your Username" />
											<ErrorMessage name="username" component="div" className="error text-red-500" />
										</div>
									</div>

									<div className="input-groups">
										<div className="input-box">
											<i className="fas fa-envelope"></i>
											<Field type="email" name="email" className="input" placeholder="Enter your email" />
											<ErrorMessage name="email" component="div" className="error text-red-500" />
										</div>
									</div>

									<div className="input-groups">
										<div className="input-box">
											<i className="fa-solid fa-lock"></i>
											<Field type="password" name="password1" className="input" placeholder="Enter your password" />
											<ErrorMessage name="password1" component="div" className="error text-red-500" />
										</div>
									</div>
									<div className="input-groups">
										<div className="input-box">
											<i className="fa-solid fa-lock"></i>
											<Field type="password" name="password2" className="input" placeholder="Confirm Password" />
											<ErrorMessage name="password2" component="div" className="error text-red-500" />
										</div>
									</div>
									<div className="input-groups invert">
										<div className="button input-box">
											<button type="submit">Submit</button>
										</div>
									</div>

									<div className="form-link signup-text">
										<span>
											Already have an account?{' '}
											<label className="link login-link invert" htmlFor="flip">
												Login now
											</label>
										</span>
									</div>
								</Form>
							</Formik>
						</div>
					</div>
				</div>
			</div>
			<style jsx>
				{`
					*{
						margin: 0;
						padding: 0;
						box-sizing: border-box;
						text-decoration: none;
						outline: none;
						list-style: none;
						font-size 30px;
					}
					
					body {
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
						/*line-height: 1.4em;*/
						/*height: 100vh;*/
						background-color: #5ac994;
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 30px;
						
					}
					
					.container {
						position: relative;
						width: 100%;
						max-width: 850px;
						background: #fff;
						padding: 40px 30px;
						box-shadow: 0 5px 10px rgba(0,0,0,0.2);
						perspective: 2700px;
					}
					
					.container .cover {
						position: absolute;
						height: 100%;
						width: 50%;
						left: 50%;
						top: 0;
						z-index: 98;
						transition: all 1s ease;
						transform-origin: left;
						transform-style: preserve-3d;
					}
					
					.container .cover::before {
						content: '';
						position: absolute;
						width: 100%;
						height: 100%;
						background: #5ac994;
						opacity: 0.5;
						z-index: 100;
					}
					
					.container .cover::after {
						content: '';
						position: absolute;
						width: 100%;
						height: 100%;
						background: #5ac994;
						opacity: 0.5;
						z-index: 100;
						transform: rotateY(180deg);
					}
					
					.container #flip:checked ~.cover {
						transform: rotateY(-180deg);
					}
					
					.container .cover img {
						position: absolute;
						height: 100%;
						width: 100%;
						object-fit: cover;
						z-index: 12;
						backface-visibility: hidden;
					}
					
					.container .cover .back .back-img{
						transform: rotateY(180deg);
					}
					
					.container .cover .form-link {
						position: absolute;
						z-index: 111;
						width: 100%;
						height: 100%;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
					}
					
					.cover .form-link .img-text-1,
					.cover .form-link .img-text-2 {
						font-size: 26px;
						font-weight: 600;
						color:#fff;
						text-align: center;
						backface-visibility: hidden;
					}
					
					
					.cover .back .form-link .img-text-1,
					.cover .back .form-link .img-text-2 {
						transform: rotateY(180deg);
					}
					
					.cover .form-link .img-text-2 {
						font-size: 15px;
						font-weight: 500;
					}
					
					.container form {
						height: 100%;
						width: 100%;
						background: #fff;
					}
					
					.container .form-content {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					
					.form-content .login-form,
					.form-content .sign-form {
					
						width: calc(100% / 2 - 25px);
					}
					
					.login-form {
						margin-right: 30px;
					}
					
					#form .form-content .title {
						position: relative;
						font-size: 2rem;
						font-weight: 500;
						color:#333;
					}
					
					#form .form-content .title::before {
						content: '';
						position: absolute;
						height: 3px;
						width: 25px;
						background: #5ac994;
						left: 0;
						bottom: 0;
					}
					
					#form .sign-#form .title::before {
						width: 22px;
					}
					
					
					#form .form-content .input-groups {
						margin-top: 30px;
					}
					
					#form .form-content .input-box {
						position: relative;
						display: flex;
						align-items: center;
						height: 50px;
						width: 100%;
						margin: 10px 0;
					}
					
					#form .form-content .input-box .input {
						height: 100%;
						width: 100%;
						outline: none;
						border: none;
						padding: 0 30px;
						font-size: 16px;
						font-weight: 500;
						border-bottom: 2px solid #bababa;	
						transition: all 0.3s  ease
					}
					
					#form .form-content .input-box .input:focus,
					#form .form-content .input-box .input:valid {
						border-bottom-color: #5ac994;
					}
					
					#form .form-content .input-box i {
						position: absolute;
						color: #5ac994;
						font-size: 18px;
					}
					
					
					#form .form-content .button {
						margin-top: 40px;
					}
					
					button {
						width: 100%;
						height: 100%;
						position: relative;
						z-index: 1;
						transition: ease-out 0.3s;
						color: #124143;
						background-color: #c0f7b7;
						border: none;
						font-weight: 500;
						font-size: 17px;
						cursor: pointer;
						border-radius: 6px;
					}
					
					#form .form-content .button button:hover {
						color: #c0f7b7;
						cursor: pointer;
					}
					
					#form .form-content .button button::before {
						content: "";
						position: absolute;
						opacity: 0;
						top:0;
						bottom: 0;
						left: 50%;
						right: 50%;
						transition: 0.5s all ease;
					   background: rgb(20,27,41);
					background: linear-gradient(90deg, rgba(20,27,41,1) 0%, rgba(18,65,67,1) 50%, rgba(90,201,148,1) 100%);
						border-radius: 6px;
					}
					
					#form .form-content .button button:hover::before {
						opacity: 1;
						z-index: -2;
						transition: 0.5s all ease;
						left: 0;
						right: 0;
					}
					
					#form .form-content .form-link label {
						font-size: 14px;
						font-weight: 500;
						color:#333;
						cursor: pointer;
					}
					
					#form .form-content .form-link label:hover {
						text-decoration: underline;
					}
					
					#form .form-content .pass a {
						color:#5ac994;
					}
					
					#form .form-content .form-link .link {
						color: #5ac994;
					}
					
					#form .form-content .login-text,
					#form .form-content .signup-text {
						text-align: center;
						margin-top: 25px;
					}
					
					.container #flip {
						display: none;
					}
					
					@media (max-width:730px) {
						.container .cover {
							display: none;
						}
						
						.form-content .login-form,
						.form-content .sign-form {
					
						width: 100%;
						}
						
						.form-content .sign-form {
							display: none;
						}
						
						.container #flip:checked ~ #form .sign-form {
							display: block;
						}
						
						.container #flip:checked ~ #form .login-form {
							display: none;
						}
					
					}
				`}
			</style>
		</div>

	)
}


const LoginUser = (user) => {
	return axios.post("http://127.0.0.1:8000/dj-rest-auth/login/", user, {
		withCredentials: true,
	});
};

const useLoginUser = () => {
	const router = useRouter();
	let { setauth } = useContext(Context);
	return useMutation({
		mutationFn: LoginUser,
		onSuccess: async (res) => {
			Cookies.set(
				"auth",
				JSON.stringify(res.data),
				{ expires: 365, path: "/" }
			);
			setauth(res.data);
			toast('Logged In Successfully')
			router.push("/");
			
		},
		onError: (error) => {
			const newerror = error.response.data;
			toast('Invalid Credentials')
		},
	});
};


const CreateUser = async (user) => {
    return axios
        .post(
            "http://127.0.0.1:8000/dj-rest-auth/registration/",
            user,
            {
                withCredentials: true,
            }
        )
        .then((response) => {
            return response.data;
        });
};

const ResendEmail = async (email) =>{
    return axios.post('http://127.0.0.1:8000/dj-rest-auth/registration/resend-email/',{email:email}).then((response)=>{
        
    })
}

const useCreateUser = () => {
    const router = useRouter();
    return useMutation( {
		mutationFn: CreateUser,
        onSuccess: (response) => {
            
            // router.push('/JoinUsPage')
            toast('Activation Link Send To Your Email')
        },
        onError: (error) => {
            const email = JSON.parse(error.config.data).email
            const newerror = error.response.data;
            
            if (error.message == "Network Error") {
                toast('Network Error')
            }
			
            else if (newerror.non_field_errors) {
                if(newerror.non_field_errors[0] == "Resent Email"){
                    ResendEmail(email)
                    toast('Activation Link Send To Your Email')
                }
                else{
                    toast.error(newerror.non_field_errors[0]);
                } 
            }
            else {
				if(error.response.data.username){
					toast.error(error.response.data.username[0]);
				}
				else if(error.response.data.email){
					toast.error(error.response.data.email[0]);
				}
				else if(error.response.data.password1){
					toast.error(error.response.data.password1[0]);
				}
				else if(error.response.data.password2){
					toast.error(error.response.data.password2[0]);
				}
				else{

                	toast('Signup Failed')
				}
            }
        },
    });
};