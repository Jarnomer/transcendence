import React, { useState, useEffect } from "react";
import axios from 'axios';
import { getUsers } from "../services/api";


export const HomePage: React.FC = () => {

	return (
		<>
			<h1>Lorem Ipsum</h1>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur dignissim magna quis est lacinia, et vestibulum elit egestas. In consequat turpis vitae massa rhoncus sagittis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer sit amet velit sed odio eleifend molestie id non dui. Fusce facilisis nulla sapien, nec euismod arcu lacinia ac. Etiam posuere risus odio, quis pulvinar dui pharetra et. Praesent consequat odio justo, vel cursus lacus varius fringilla. Nam eu sodales purus. Fusce pharetra fermentum fermentum. Cras sed porta mi.

				Morbi at accumsan neque, in vestibulum lacus. Nulla magna libero, tincidunt quis dui eu, aliquet porttitor urna. Proin sit amet porttitor urna, nec convallis turpis. Suspendisse volutpat facilisis eros, eget laoreet purus ultrices id. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In semper dapibus odio, in mattis augue suscipit vitae. Curabitur scelerisque, sem fringilla accumsan facilisis, massa arcu porttitor nisi, quis vehicula leo quam ut metus. Donec cursus lectus non elit tempor, id fermentum lacus scelerisque. Morbi ac cursus sem. Sed viverra dolor massa. Integer id quam magna. Proin feugiat nulla non turpis commodo mattis.

				Integer iaculis commodo turpis, quis rutrum eros ultrices in. Fusce egestas odio in neque lacinia fermentum. Donec ullamcorper efficitur purus ac feugiat. Aenean sed congue ligula. Suspendisse lobortis, dui et suscipit hendrerit, nunc mi facilisis urna, id fermentum nunc ligula quis ipsum. In vel dolor mattis, lobortis justo a, scelerisque ipsum. Vestibulum malesuada quam in ex dictum, eu rutrum ex efficitur. Aliquam mauris tortor, facilisis at ex in, ornare condimentum diam. Morbi dignissim lobortis efficitur. Nullam vel dui pretium, bibendum justo eu, suscipit libero. Cras vulputate felis vel pulvinar congue. Curabitur mauris mauris, fringilla vel dui eu, porta fermentum nibh. Integer et ultrices risus. Ut fermentum enim id vestibulum blandit.

				Sed malesuada maximus auctor. Nam sed interdum purus. Vivamus ex eros, bibendum a dignissim nec, tempus sit amet nisi. In turpis arcu, congue non accumsan vel, luctus vel erat. Nullam at faucibus tortor. Etiam congue ante arcu, at tristique purus sagittis sit amet. Cras quis facilisis mi.

				Nunc maximus lorem non pretium fermentum. Integer ultrices cursus odio, eget feugiat libero maximus et. Nulla at interdum ipsum, in semper elit. In id lacus lobortis, posuere leo ut, dapibus erat. Duis lobortis turpis lorem, ac efficitur sem venenatis in. Etiam pharetra metus accumsan lorem ullamcorper commodo. Duis vel eleifend enim. Nunc nec augue ac est tincidunt semper vitae vitae sapien. Sed pulvinar nunc metus, vel lobortis lorem ultricies id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis porta lobortis neque, sit amet semper neque bibendum dictum. Donec sagittis quis risus eget aliquam. Sed non faucibus ligula, sit amet vehicula arcu. Quisque eget rutrum urna, dapibus elementum metus. Donec vel libero ut lectus tincidunt molestie. Fusce dapibus tellus euismod, condimentum magna id, molestie massa.</p>
		</>
	)
}