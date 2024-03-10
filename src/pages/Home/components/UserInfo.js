import { Button, message } from 'antd'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'
import { useNavigate } from 'react-router-dom'



const UserInfo = () => {
    const signout = () => {
        signOut(auth).then(() => {
            console.log("Sign Out Called")
            message.success("Logout successed")
        }).catch((error) => {
            console.log("error??")
            message.success("Logout Failed, please try again later")
        });
    }
    return (
        <div>This is the homepage
            <Button type="primary" onClick={signout}>
                Logout!
            </Button>
        </div>
    )

}

export default UserInfo