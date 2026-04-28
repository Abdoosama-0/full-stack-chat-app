
import React from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useUserData } from "../../store/userData";
import { MdEdit } from "react-icons/md";


interface Props {  
    chatId: number;
    chatName: string;
}

const EditGroupName = ({ chatId, chatName }: Props) => {
  const [clicked, setClicked] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [newName, setNewName] = React.useState(chatName);
  


  const { token } = useUserData();


 const handleEdit = async () => {
  
  try {
    const res = await fetch(
      `http://localhost:5000/api/chat/${chatId}/name`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Edit failed");
      return;
    }
    alert("Group name updated");


    // 🔥 سيب السوكت يحدث الرسالة
    setEditMode(false);
    setClicked(false);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  return (
    <div >
      <MdEdit 

        onClick={() => setClicked(true)}
        className="cursor-pointer"
      />

      {clicked && (
       
    
    
     

            <div onClick={()=>setClicked(false)} className=" fixed inset-0 flex items-center justify-center bg-black/90">
            <div  onClick={(e) => e.stopPropagation()} className="p-2 bg-white rounded">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border rounded-md px-2 py-1"
              />
              <button onClick={handleEdit} className="ml-2 bg-blue-500 text-white px-3 py-1 rounded">
                Save
              </button>
          
          </div>
            </div>
            
       
      

       
      )}
    </div>
  );
};

export default EditGroupName;