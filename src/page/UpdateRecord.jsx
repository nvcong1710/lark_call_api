import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UpdateRecord() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState({
        fields: {
            Date: 0,
            'Single Option': '',
            Task: '',
            id: ''
        },
        id: '',
        record_id: ''
    });

    const fetchRecord = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/records/getbyid/${id}`, {
                method: 'GET'
            });
            const data = await res.json();
            setTask(data.data.record);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchRecord();
    }, [id])


    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask(prevData => ({
            ...prevData,
            fields: {
                ...prevData.fields,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/api/records/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });

            if (response.ok) {
                console.log('Record updated successfully');
                navigate("/Home");
            } else {
                console.error('Failed to update record');
            }
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    return (<>
        <a href="/Home">Trở về</a>
        <form onSubmit={handleSubmit}>
            <label>
                Date:
                <input
                    type="date"
                    name="Date"
                    value={new Date(task.fields.Date).toISOString().slice(0, 10)}
                    onChange={handleChange}
                />
            </label>
            <label>
                Single Option:
                <input
                    type="text"
                    name="Single Option"
                    value={task.fields['Single Option']}
                    onChange={handleChange}
                />
            </label>
            <label>
                Task:
                <input
                    type="text"
                    name="Task"
                    value={task.fields.Task}
                    onChange={handleChange}
                />
            </label>
            <input type="hidden" name="id" value={task.fields.id} />
            <button type="submit">Update</button>
        </form>
    </>);
}

export default UpdateRecord;