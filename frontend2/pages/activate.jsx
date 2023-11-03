import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
const Activate = (props) => {
	const router = useRouter();
	useEffect(()=>{
        if (props.data == "success") {
            router.push("/JoinUsPage");
            toast.success("Account activated successfully");
        }
        else {
            router.push("/JoinUsPage");
            toast.error("Account activation failed");
        }
    },[])
	
	return (
		<div className='flex justify-center w-full h-screen items-center font-bold text-2xl'>
			<div>Processing...</div>
		</div>
	);
};

export default Activate;

export async function getServerSideProps(context) {
	// display a toast message if the response is succesful
	const { key } = context.query;
	const url = `http://127.0.0.1:8000/dj-rest-auth/registration/verify-email/`;
	const payload = {
		key,
	};
	try {
		const response = await axios.post(url, payload);
		

		return {
			props: {
				data: "success"
			}
		};
	} catch (error) {

		return {
			props: {
				data: "failure"
			}
		};
	}
}