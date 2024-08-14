import { useState } from "react";
import { useNavigate } from "react-router-dom";


function CreateRecord() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Date: '',
        Task: '',
        Person: [{ id: '' }],
        'Single Option': ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fields = {
            Date: new Date(formData.Date).getTime(),
            Task: formData.Task,
            'Single Option': formData['Single Option'],
        };

        if (formData.Person && formData.Person[0].id !== '') {
            fields.Person = formData.Person;
        }

        console.log(fields);
        try {
            const response = await fetch('http://localhost:3001/api/records/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: fields,
                }),
            });

            if (response.ok) {
                console.log('Record created successfully');
                navigate("/");
            } else {
                console.error('Failed to create record');
            }
        } catch (error) {
            console.error('Error creating record:', error);
        }
    };


    return (<>
        <a href="/">Trở về</a>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Date:</label>
                <input
                    type="date"
                    name="Date"
                    value={formData.Date}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Task:</label>
                <input
                    type="text"
                    name="Task"
                    value={formData.Task}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Person ID:</label>
                <input
                    type="text"
                    name="Person[0].id"
                    value={formData.Person[0].id}
                    onChange={(e) => {
                        const id = e.target.value;
                        setFormData({
                            ...formData,
                            Person: [{ id }]
                        });
                    }}
                />
            </div>
            <div>
                <label>Single Option:</label>
                <select
                    name="Single Option"
                    value={formData['Single Option']}
                    onChange={handleChange}
                >
                    <option value="">Select an option</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                </select>
            </div>
            <button type="submit">Submit</button>
        </form>
    </>);
}

export default CreateRecord;